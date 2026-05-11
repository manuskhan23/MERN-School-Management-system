import User from '../models/User.js';
import Class from '../models/Class.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';

// @desc Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalClasses = await Class.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    const recentNotifications = await Notification.find()
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent assignments
    const recentAssignments = await Assignment.find()
      .populate('class', 'className section')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      totalAssignments,
      activeUsers,
      suspendedUsers,
      recentNotifications,
      recentAssignments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get attendance report
export const getAttendanceReport = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;
    const matchQuery = {};

    if (classId) matchQuery.class = classId;
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    // Get classes with attendance summary
    const classes = await Class.find(classId ? { _id: classId } : {})
      .populate('assignedTeacher', 'name')
      .lean();

    const report = [];
    for (const cls of classes) {
      const totalRecords = await Attendance.countDocuments({ class: cls._id, ...matchQuery.date ? { date: matchQuery.date } : {} });
      const presentCount = await Attendance.countDocuments({ class: cls._id, status: 'present', ...matchQuery.date ? { date: matchQuery.date } : {} });
      const absentCount = await Attendance.countDocuments({ class: cls._id, status: 'absent', ...matchQuery.date ? { date: matchQuery.date } : {} });
      const lateCount = await Attendance.countDocuments({ class: cls._id, status: 'late', ...matchQuery.date ? { date: matchQuery.date } : {} });

      report.push({
        classId: cls._id,
        className: cls.className,
        section: cls.section,
        teacher: cls.assignedTeacher?.name || 'Unassigned',
        totalStudents: cls.students.length,
        totalRecords,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        percentage: totalRecords > 0 ? (((presentCount + lateCount) / totalRecords) * 100).toFixed(1) : 0,
      });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get performance report
export const getPerformanceReport = async (req, res) => {
  try {
    const { classId } = req.query;
    const query = {};
    if (classId) query.class = classId;

    const assignments = await Assignment.find(query)
      .populate('class', 'className section')
      .populate('submissions.student', 'name email')
      .lean();

    // Build student performance map
    const studentMap = {};

    for (const assignment of assignments) {
      for (const sub of assignment.submissions) {
        if (sub.grade !== undefined && sub.grade !== null) {
          const studentId = sub.student?._id?.toString();
          if (!studentId) continue;

          if (!studentMap[studentId]) {
            studentMap[studentId] = {
              student: sub.student,
              className: assignment.class?.className,
              section: assignment.class?.section,
              grades: [],
              totalAssignments: 0,
              submittedAssignments: 0,
            };
          }
          studentMap[studentId].grades.push(sub.grade);
          studentMap[studentId].submittedAssignments++;
        }
      }
    }

    const performance = Object.values(studentMap).map((s) => ({
      ...s,
      averageGrade: s.grades.length > 0 ? (s.grades.reduce((a, b) => a + b, 0) / s.grades.length).toFixed(1) : 0,
      totalGraded: s.grades.length,
    }));

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get activity logs
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await Notification.countDocuments();
    const logs = await Notification.find()
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
