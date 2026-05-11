import express from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getAssignments).post(authorize('teacher'), upload.array('attachments', 5), createAssignment);
router.route('/:id').get(getAssignmentById).put(authorize('teacher'), updateAssignment).delete(authorize('admin', 'teacher'), deleteAssignment);
router.put('/:id/submit', authorize('student'), upload.single('file'), submitAssignment);
router.put('/:id/grade/:studentId', authorize('teacher'), gradeSubmission);

export default router;
