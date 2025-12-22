import pool from '../config/db.js';

class Leave {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.managerId = data.manager_id;
    this.fromDate = data.from_date;
    this.toDate = data.to_date;
    this.leaveType = data.leave_type;
    this.reason = data.reason;
    this.note = data.note;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new leave request
  static async create(leaveData) {
    const { userId, managerId, fromDate, toDate, leaveType, reason, note } = leaveData;
    
    const query = `
      INSERT INTO leaves (user_id, manager_id, from_date, to_date, leave_type, reason, note, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW(), NOW())
      RETURNING *
    `;
    
    const values = [userId, managerId, fromDate, toDate, leaveType, reason, note || null];
    
    try {
      const result = await pool.query(query, values);
      return new Leave(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find leave by ID
  static async findById(id) {
    const query = 'SELECT * FROM leaves WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length > 0) {
        return new Leave(result.rows[0]);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Find all leaves for a user
  static async findByUserId(userId) {
    const query = 'SELECT * FROM leaves WHERE user_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => new Leave(row));
    } catch (error) {
      throw error;
    }
  }

  // Find all leaves for a manager (leaves where they are the approver)
  static async findByManagerId(managerId) {
    const query = `
      SELECT l.*, 
        u.first_name, u.last_name, u.email, u.employee_id
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      WHERE l.manager_id = $1
      ORDER BY l.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [managerId]);
      return result.rows.map(row => ({
        ...new Leave(row),
        userFirstName: row.first_name,
        userLastName: row.last_name,
        userEmail: row.email,
        userEmployeeId: row.employee_id,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Update leave status (approve/reject)
  static async updateStatus(id, status) {
    const query = `
      UPDATE leaves 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [status, id]);
      if (result.rows.length > 0) {
        return new Leave(result.rows[0]);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Get all leaves (admin)
  static async findAll() {
    const query = `
      SELECT l.*, 
        u.first_name, u.last_name, u.email, u.employee_id
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows.map(row => ({
        ...new Leave(row),
        userFirstName: row.first_name,
        userLastName: row.last_name,
        userEmail: row.email,
        userEmployeeId: row.employee_id,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return { ...this };
  }
}

export default Leave;

