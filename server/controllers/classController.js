import Class from '../models/Class.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';

// @desc Get all classes
export const getClasses = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'teacher') {
      query.assignedTeacher = req.user._id;
    } else if (req.user.role === 'student') {
      query.students = req.user._id;
    }

    if (search) {
      query.className = { $regex: search, $options: 'i' };
    }

    const total = await Class.countDocuments(query);
    const classes = await Class.find(query)
      .populate('assignedTeacher', 'name email')
      .populate('students', 'name email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    res.json({ classes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get class by ID
export const getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('assignedTeacher', 'name email')
      .populate('students', 'name email profileImage');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create class (Admin only)
export const createClass = async (req, res) => {
  try {
    const { className, section, assignedTeacher } = req.body;
    if (assignedTeacher) {
      const teacher = await User.findById(assignedTeacher);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Invalid teacher' });
      }
    }
    const cls = await Class.create({
      className,
      section,
      assignedTeacher: assignedTeacher || undefined,
      createdBy: req.user._id,
    });
    const populated = await Class.findById(cls._id)
      .populate('assignedTeacher', 'name email')
      .populate('students', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update class (Admin only)
export const updateClass = async (req, res) => {
  try {
    const { className, section, assignedTeacher } = req.body;
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    if (assignedTeacher) {
      const teacher = await User.findById(assignedTeacher);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Invalid teacher' });
      }
      cls.assignedTeacher = assignedTeacher;
    }
    if (className) cls.className = className;
    if (section) cls.section = section;

    await cls.save();
    const populated = await Class.findById(cls._id)
      .populate('assignedTeacher', 'name email')
      .populate('students', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete class (Admin only)
export const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    // Clear assignedClass for all students in this class
    await User.updateMany({ _id: { $in: cls.students } }, { $unset: { assignedClass: '' } });
    // Delete associated assignments and attendance
    await Assignment.deleteMany({ class: cls._id });
    await Attendance.deleteMany({ class: cls._id });
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add student to class
export const addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    if (cls.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already in this class' });
    }

    cls.students.push(studentId);
    await cls.save();

    student.assignedClass = cls._id;
    await student.save();

    // Notify admin if teacher did it
    if (req.user.role === 'teacher') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          sender: req.user._id,
          receiver: admin._id,
          message: `Teacher ${req.user.name} added student ${student.name} to ${cls.className} ${cls.section}`,
          type: 'system',
        });
      }
    }

    const populated = await Class.findById(cls._id)
      .populate('assignedTeacher', 'name email')
      .populate('students', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Remove student from class
export const removeStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    cls.students = cls.students.filter((s) => s.toString() !== studentId);
    await cls.save();

    const student = await User.findById(studentId);
    if (student) {
      student.assignedClass = undefined;
      await student.save();
    }

    // Notify admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        sender: req.user._id,
        receiver: admin._id,
        message: `${req.user.name} removed student ${student?.name || 'Unknown'} from ${cls.className} ${cls.section}`,
        type: 'student_removed',
      });
    }

    const populated = await Class.findById(cls._id)
      .populate('assignedTeacher', 'name email')
      .populate('students', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Promote students to next class
export const promoteStudents = async (req, res) => {
  try {
    const { targetClassId } = req.body;
    const currentClass = await Class.findById(req.params.id);
    const targetClass = await Class.findById(targetClassId);

    if (!currentClass || !targetClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentIds = currentClass.students;

    // Move students to target class
    targetClass.students = [...new Set([...targetClass.students.map(s => s.toString()), ...studentIds.map(s => s.toString())])].map(s => s);
    await targetClass.save();

    // Update each student's assignedClass
    await User.updateMany({ _id: { $in: studentIds } }, { assignedClass: targetClass._id });

    // Clear current class students
    currentClass.students = [];
    await currentClass.save();

    // Notify admin and students
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        sender: req.user._id,
        receiver: admin._id,
        message: `Teacher ${req.user.name} promoted students from ${currentClass.className} to ${targetClass.className}`,
        type: 'promotion',
      });
    }

    for (const studentId of studentIds) {
      await Notification.create({
        sender: req.user._id,
        receiver: studentId,
        message: `You have been promoted to ${targetClass.className} ${targetClass.section}`,
        type: 'promotion',
      });
    }

    res.json({ message: `${studentIds.length} students promoted to ${targetClass.className} ${targetClass.section}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
