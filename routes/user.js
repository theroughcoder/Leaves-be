import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

// Register route
router.post('/register', UserController.register);

// Login route
router.post('/login', UserController.login);

// Get user profile route
router.get('/profile', UserController.getProfile);

// Update user profile route
router.put('/profile', UserController.updateProfile);

export default router;