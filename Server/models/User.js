const pool = require('../config/database');

class User {
  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  static async create({ email, passwordHash, firstName, lastName, masterKeyEncrypted }) {
    try {
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, master_key_encrypted)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name, last_name, email_verified, created_at`,
        [email.toLowerCase(), passwordHash, firstName, lastName, masterKeyEncrypted]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, data) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      // Build dynamic UPDATE query
      for (const [key, value] of Object.entries(data)) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $${index}
         RETURNING *`,
        values
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update last login timestamp
  static async updateLastLogin(id) {
    try {
      await pool.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [id]
      );
    } catch (error) {
      throw error;
    }
  }

  // Get user with master key
  static async getMasterKey(id) {
    try {
      const result = await pool.query(
        'SELECT master_key_encrypted FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0]?.master_key_encrypted || null;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
