import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  createStudent,
  getTeacherStudents,
  updateUser,
  deleteUser,
  resetPassword,
  toggleStatus,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/students', authorize('teacher'), createStudent);
router.get('/my-students', authorize('teacher'), getTeacherStudents);

router.route('/').get(authorize('admin'), getUsers).post(authorize('admin'), createUser);
router.route('/:id').get(authorize('admin'), getUserById).put(authorize('admin'), updateUser).delete(authorize('admin'), deleteUser);
router.put('/:id/reset-password', authorize('admin'), resetPassword);
router.put('/:id/toggle-status', authorize('admin'), toggleStatus);

export default router;
