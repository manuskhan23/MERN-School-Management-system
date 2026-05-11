import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';

// @desc Mark attendance for a class
export const markAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    // records = [{ student: studentId, status: 'present'|'absent'|'late' }]

    const results = [];
    for (const record of records) {
      const attendance = await Attendance.findOneAndUpdate(
        { student: record.student, class: classId, date: new Date(date) },
        {
          student: record.student,
          class: classId,
          date: new Date(date),
          status: record.status,
          markedBy: req.user._id,
        },
        { upsert: true, new: true }
      );
      results.push(attendance);
    }

    res.status(201).json({ message: 'Attendance marked successfully', count: results.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get attendance records
export const getAttendance = async (req, res) => {
  try {
    const { classId, studentId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    if (classId) query.class = classId;
    if (studentId) query.student = studentId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('student', 'name email')
      .populate('class', 'className section')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ date: -1 });

    res.json({ records, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get attendance by class for a specific date
export const getAttendanceByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const query = { class: classId };
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: d, $lt: nextDay };
    }

    const records = await Attendance.find(query)
      .populate('student', 'name email profileImage')
      .populate('class', 'className section')
      .sort({ 'student.name': 1 });

    // Also get all students in class for showing who hasn't been marked
    const cls = await Class.findById(classId).populate('students', 'name email profileImage');

    res.json({ records, classStudents: cls ? cls.students : [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get student attendance with stats
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId } = req.query;

    const query = { student: studentId };
    if (classId) query.class = classId;

    const records = await Attendance.find(query)
      .populate('class', 'className section')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;

    res.json({
      records,
      stats: { total, present, absent, late, percentage: Number(percentage) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
