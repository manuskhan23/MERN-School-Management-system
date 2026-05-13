import Assignment from '../models/Assignment.js';
import Class from '../models/Class.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc Get assignments
export const getAssignments = async (req, res) => {
  try {
    const { search, classId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    } else if (req.user.role === 'student') {
      const student = await User.findById(req.user._id);
      if (student.assignedClass) {
        query.class = student.assignedClass;
      } else {
        return res.json({ assignments: [], total: 0, page: 1, pages: 0 });
      }
    }

    if (classId) query.class = classId;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Assignment.countDocuments(query);
    const assignments = await Assignment.find(query)
      .populate('class', 'className section')
      .populate('teacher', 'name')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    res.json({ assignments, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('class', 'className section')
      .populate('teacher', 'name email')
      .populate('submissions.student', 'name email');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create assignment (Teacher)
export const createAssignment = async (req, res) => {
  try {
    const { title, description, class: classId, dueDate } = req.body;
    const attachments = req.files ? req.files.map((f) => f.path.replace(/\\/g, '/')) : [];

    const assignment = await Assignment.create({
      title,
      description,
      class: classId,
      teacher: req.user._id,
      dueDate,
      attachments,
    });

    // Notify all students in the class
    const cls = await Class.findById(classId);
    if (cls) {
      for (const studentId of cls.students) {
        await Notification.create({
          sender: req.user._id,
          receiver: studentId,
          message: `New assignment: ${title} - Due: ${new Date(dueDate).toLocaleDateString()}`,
          type: 'assignment',
        });
      }
    }

    // Notify admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        sender: req.user._id,
        receiver: admin._id,
        message: `Teacher ${req.user.name} published assignment: ${title}`,
        type: 'assignment',
      });
    }

    const populated = await Assignment.findById(assignment._id)
      .populate('class', 'className section')
      .populate('teacher', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update assignment (Teacher - owner)
export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    const { title, description, dueDate } = req.body;
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;

    await assignment.save();
    const populated = await Assignment.findById(assignment._id)
      .populate('class', 'className section')
      .populate('teacher', 'name');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (req.user.role === 'teacher' && assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Submit assignment (Student)
export const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // Check if assignment is past due
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    if (now > dueDate) {
      return res.status(400).json({ message: 'Assignment is past due. No more submissions allowed.' });
    }

    const { text } = req.body;
    const file = req.file ? req.file.path.replace(/\\/g, '/') : '';

    // Check if already submitted, update if so
    const existingIndex = assignment.submissions.findIndex(
      (s) => s.student.toString() === req.user._id.toString()
    );

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex].text = text || assignment.submissions[existingIndex].text;
      if (file) assignment.submissions[existingIndex].file = file;
      assignment.submissions[existingIndex].submittedAt = new Date();
    } else {
      assignment.submissions.push({
        student: req.user._id,
        file,
        text: text || '',
        submittedAt: new Date(),
      });
    }

    await assignment.save();
    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Grade a submission (Teacher)
export const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const submission = assignment.submissions.find(
      (s) => s.student.toString() === req.params.studentId
    );
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.grade = grade;
    submission.feedback = feedback || '';
    await assignment.save();

    // Notify student
    await Notification.create({
      sender: req.user._id,
      receiver: req.params.studentId,
      message: `Your assignment "${assignment.title}" has been graded: ${grade}`,
      type: 'grade',
    });

    res.json({ message: 'Submission graded', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
