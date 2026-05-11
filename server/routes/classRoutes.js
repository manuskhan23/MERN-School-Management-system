import express from 'express';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
  promoteStudents,
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getClasses).post(authorize('admin'), createClass);
router.route('/:id').get(getClassById).put(authorize('admin'), updateClass).delete(authorize('admin'), deleteClass);
router.put('/:id/add-student', authorize('admin', 'teacher'), addStudent);
router.put('/:id/remove-student', authorize('admin', 'teacher'), removeStudent);
router.put('/:id/promote', authorize('teacher'), promoteStudents);

export default router;
