import { Router } from 'express';
import { register, login, getCurrentUser, getAllUsers } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.get('/users', authenticate, authorize(UserRole.ADMIN), getAllUsers);

export default router;
