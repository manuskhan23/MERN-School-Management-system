import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getUnreadCount,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications).post(authorize('admin', 'teacher'), createNotification);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.route('/:id/read').put(markAsRead);
router.route('/:id').delete(deleteNotification);

export default router;
