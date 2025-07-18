import { Router } from 'express';
import { register, login, logout, getProfile } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);

export default router;
