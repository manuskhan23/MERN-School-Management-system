import express from 'express';
import {
  getDashboardStats,
  getAttendanceReport,
  getPerformanceReport,
  getActivityLogs,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/attendance', getAttendanceReport);
router.get('/performance', getPerformanceReport);
router.get('/activity', getActivityLogs);

export default router;
