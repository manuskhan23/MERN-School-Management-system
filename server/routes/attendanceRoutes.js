import express from 'express';
import {
  markAttendance,
  getAttendance,
  getAttendanceByClass,
  getStudentAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').post(authorize('teacher'), markAttendance).get(getAttendance);
router.get('/class/:classId', getAttendanceByClass);
router.get('/student/:studentId', getStudentAttendance);

export default router;
