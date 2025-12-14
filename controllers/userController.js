import User from '../models/User.js';
import pool from '../config/db.js';
import { validateEmail, validateLength } from '../utils/validation.js';
import { generateToken } from '../utils/tokens.js';

class UserController {
  // Register a new user
  static async register(req, res) {
    try {
      const { firstName, lastName, email, password, department, role, employeeId } = req.body;

      // Validation
      if (!firstName || !lastName || !email || !password || !department || !role || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Validate password length
      if (!validateLength(password, 8, 50)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be between 8 and 50 characters'
        });
      }

      // Validate name lengths
      if (!validateLength(firstName, 2, 50) || !validateLength(lastName, 2, 50)) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 50 characters'
        });
      }

      // Check if user already exists with this email
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Check if user already exists with this employee ID
      const existingUserByEmployeeId = await User.findByEmployeeId(employeeId);
      if (existingUserByEmployeeId) {
        return res.status(409).json({
          success: false,
          message: 'User with this employee ID already exists'
        });
      }

      // Create new user
      const userData = {
        firstName,
        lastName,
        email,
        password,
        department,
        role,
        employeeId
      };

      const newUser = await User.create(userData);

      // Generate JWT token
      const token = generateToken(
        { 
          id: newUser.id, 
          email: newUser.email,
          employeeId: newUser.employeeId,
          role: newUser.role,
        }, 
        '7d'
      );

      // Return success response
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: newUser.toJSON(),
        token
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific database errors
      if (error.code === '23505') { // Unique constraint violation
        if (error.constraint === 'users_email_key') {
          return res.status(409).json({
            success: false,
            message: 'User with this email already exists'
          });
        } else if (error.constraint === 'users_employee_id_key') {
          return res.status(409).json({
            success: false,
            message: 'User with this employee ID already exists'
          });
        }
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = generateToken(
        { 
          id: user.id, 
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
        }, 
        '7d'
      );

      // Return success response
      res.json({
        success: true,
        message: 'Login successful',
        user: user.toJSON(),
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, department, role } = req.body;

      // Validation
      if (firstName && !validateLength(firstName, 2, 50)) {
        return res.status(400).json({
          success: false,
          message: 'First name must be between 2 and 50 characters'
        });
      }

      if (lastName && !validateLength(lastName, 2, 50)) {
        return res.status(400).json({
          success: false,
          message: 'Last name must be between 2 and 50 characters'
        });
      }

      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (firstName) {
        updateFields.push(`first_name = $${paramCount++}`);
        values.push(firstName);
      }

      if (lastName) {
        updateFields.push(`last_name = $${paramCount++}`);
        values.push(lastName);
      }

      if (department) {
        updateFields.push(`department = $${paramCount++}`);
        values.push(department);
      }

      if (role) {
        updateFields.push(`role = $${paramCount++}`);
        values.push(role);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      const updatedUser = new User(result.rows[0]);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser.toJSON()
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all users [ADMIN]
  static async getAllUsers(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const users = await User.findAll();
      res.json({ success: true, users: users.map(user => user.toJSON()) });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default UserController;
