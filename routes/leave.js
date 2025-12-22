import express from 'express';
import LeaveController from '../controllers/leaveController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new leave request
router.post('/', LeaveController.createLeave);

// Get all leaves for the current user
router.get('/my-leaves', LeaveController.getUserLeaves);

// Get all leaves where the current user is the manager
router.get('/manager-leaves', LeaveController.getManagerLeaves);

// Get all leaves (admin only)
router.get('/all', LeaveController.getAllLeaves);

// Get leave by ID
router.get('/:id', LeaveController.getLeaveById);

// Update leave status (approve/reject) - for managers
router.patch('/:id/status', LeaveController.updateLeaveStatus);

export default router;

