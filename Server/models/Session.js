const pool = require('../config/database');

class Session {
  // Create new session
  static async create({ userId, tokenHash, refreshTokenHash, ipAddress, userAgent, expiresAt }) {
    try {
      const result = await pool.query(
        `INSERT INTO sessions (user_id, token_hash, refresh_token_hash, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, created_at`,
        [userId, tokenHash, refreshTokenHash, ipAddress, userAgent, expiresAt]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find session by user ID
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM sessions WHERE user_id = $1 AND expires_at > NOW()',
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Find session by token hash
  static async findByTokenHash(tokenHash) {
    try {
      const result = await pool.query(
        'SELECT * FROM sessions WHERE token_hash = $1 AND expires_at > NOW()',
        [tokenHash]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update session tokens
  static async updateTokens(userId, tokenHash, refreshTokenHash, expiresAt) {
    try {
      const result = await pool.query(
        `UPDATE sessions 
         SET token_hash = $2, refresh_token_hash = $3, expires_at = $4, updated_at = NOW()
         WHERE user_id = $1
         RETURNING *`,
        [userId, tokenHash, refreshTokenHash, expiresAt]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Invalidate session (logout)
  static async invalidate(userId) {
    try {
      await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Cleanup expired sessions
  static async cleanupExpired() {
    try {
      const result = await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
      return result.rowCount;
    } catch (error) {
      throw error;
    }
  }

  // Get session count for user
  static async getCountByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) FROM sessions WHERE user_id = $1 AND expires_at > NOW()',
        [userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Session;
