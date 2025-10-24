import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

class User {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
    this.password = data.password;
    this.department = data.department;
    this.position = data.position;
    this.employeeId = data.employee_id;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { firstName, lastName, email, password, department, position, employeeId } = userData;
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (first_name, last_name, email, password, department, position, employee_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [firstName, lastName, email, hashedPassword, department, position, employeeId];
    
    try {
      const result = await pool.query(query, values);
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await pool.query(query, [email]);
      if (result.rows.length > 0) {
        return new User(result.rows[0]);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by employee ID
  static async findByEmployeeId(employeeId) {
    const query = 'SELECT * FROM users WHERE employee_id = $1';
    
    try {
      const result = await pool.query(query, [employeeId]);
      if (result.rows.length > 0) {
        return new User(result.rows[0]);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length > 0) {
        return new User(result.rows[0]);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Get user data without password
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

export default User;
