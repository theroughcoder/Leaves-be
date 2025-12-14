import express from 'express';
import UserController from '../controllers/userController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Register route
router.post('/admin/register', UserController.register);

// Login route
router.post('/login', UserController.login);

// Get user profile route (protected)
router.get('/profile', authenticateToken, UserController.getProfile);

// Update user profile route (protected)
router.put('/profile', authenticateToken, UserController.updateProfile);

// Get all users (admin only)
router.get('/admin/users', authenticateToken, UserController.getAllUsers);

export default router;