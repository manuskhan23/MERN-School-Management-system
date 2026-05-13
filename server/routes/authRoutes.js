import express from 'express';
import { register, login, logout, getMe, forgotPassword, updateProfile, changePassword } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', protect, authorize('admin'), register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;