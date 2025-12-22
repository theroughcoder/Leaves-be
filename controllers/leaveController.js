import Leave from '../models/Leave.js';
import User from '../models/User.js';

class LeaveController {
  // Create a new leave request
  static async createLeave(req, res) {
    try {
      const { fromDate, toDate, leaveType, reason, note } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!fromDate || !toDate || !leaveType || !reason) {
        return res.status(400).json({ 
          error: 'Missing required fields: fromDate, toDate, leaveType, reason' 
        });
      }

      // Get user to find their manager
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.managerId) {
        return res.status(400).json({ 
          error: 'You cannot request leave without an assigned manager' 
        });
      }

      // Validate dates
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from > to) {
        return res.status(400).json({ 
          error: 'From date must be before or equal to To date' 
        });
      }

      // Create leave request
      const leave = await Leave.create({
        userId,
        managerId: user.managerId,
        fromDate,
        toDate,
        leaveType,
        reason,
        note
      });

      res.status(201).json({ 
        message: 'Leave request created successfully', 
        leave: leave.toJSON() 
      });
    } catch (error) {
      console.error('Error creating leave:', error);
      res.status(500).json({ error: 'Failed to create leave request' });
    }
  }

  // Get all leaves for the current user
  static async getUserLeaves(req, res) {
    try {
      const userId = req.user.id;
      const leaves = await Leave.findByUserId(userId);
      res.json({ leaves });
    } catch (error) {
      console.error('Error fetching user leaves:', error);
      res.status(500).json({ error: 'Failed to fetch leaves' });
    }
  }

  // Get all leaves where the current user is the manager
  static async getManagerLeaves(req, res) {
    try {
      const managerId = req.user.id;
      const leaves = await Leave.findByManagerId(managerId);
      res.json({ leaves });
    } catch (error) {
      console.error('Error fetching manager leaves:', error);
      res.status(500).json({ error: 'Failed to fetch leaves' });
    }
  }

  // Update leave status (approve/reject) - for managers
  static async updateLeaveStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const managerId = req.user.id;

      // Validate status
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status. Must be "approved" or "rejected"' 
        });
      }

      // Check if leave exists
      const leave = await Leave.findById(id);
      if (!leave) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      // Check if the current user is the manager for this leave
      if (leave.managerId !== managerId) {
        return res.status(403).json({ 
          error: 'You are not authorized to approve/reject this leave request' 
        });
      }

      // Update status
      const updatedLeave = await Leave.updateStatus(id, status);
      res.json({ 
        message: `Leave request ${status} successfully`, 
        leave: updatedLeave.toJSON() 
      });
    } catch (error) {
      console.error('Error updating leave status:', error);
      res.status(500).json({ error: 'Failed to update leave status' });
    }
  }

  // Get all leaves (admin only)
  static async getAllLeaves(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Access denied. Admin privileges required.' 
        });
      }

      const leaves = await Leave.findAll();
      res.json({ leaves });
    } catch (error) {
      console.error('Error fetching all leaves:', error);
      res.status(500).json({ error: 'Failed to fetch leaves' });
    }
  }

  // Get leave by ID
  static async getLeaveById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const leave = await Leave.findById(id);
      if (!leave) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      // Check if user has permission to view this leave
      if (leave.userId !== userId && leave.managerId !== userId && userRole !== 'admin') {
        return res.status(403).json({ 
          error: 'You are not authorized to view this leave request' 
        });
      }

      res.json({ leave: leave.toJSON() });
    } catch (error) {
      console.error('Error fetching leave:', error);
      res.status(500).json({ error: 'Failed to fetch leave' });
    }
  }
}

export default LeaveController;

