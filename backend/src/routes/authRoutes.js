import { Router } from 'express';
import { login, getCurrentUser, forgotPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, getCurrentUser);

export default router;
