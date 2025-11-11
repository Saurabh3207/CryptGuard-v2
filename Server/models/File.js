const pool = require('../config/database');

class File {
  // Create file record
  static async create({
    userId,
    fileName,
    originalName,
    fileSize,
    mimeType,
    r2Key,
    encryptionMetadata,
    fileHash,
    metadata
  }) {
    try {
      const result = await pool.query(
        `INSERT INTO files 
         (user_id, file_name, original_name, file_size, mime_type, r2_key, encryption_metadata, file_hash, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [userId, fileName, originalName, fileSize, mimeType, r2Key, JSON.stringify(encryptionMetadata), fileHash, JSON.stringify(metadata || {})]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find file by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM files WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find files by user ID
  static async findByUserId(userId, limit = 100, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT * FROM files 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Find file by hash (duplicate check)
  static async findByHash(fileHash, userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM files WHERE file_hash = $1 AND user_id = $2',
        [fileHash, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update file
  static async update(id, data) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      for (const [key, value] of Object.entries(data)) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE files SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $${index}
         RETURNING *`,
        values
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete file
  static async delete(id) {
    try {
      await pool.query('DELETE FROM files WHERE id = $1', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get file count for user
  static async getCountByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) FROM files WHERE user_id = $1',
        [userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Get total storage used by user
  static async getStorageByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT COALESCE(SUM(file_size), 0) as total_storage FROM files WHERE user_id = $1',
        [userId]
      );
      return parseInt(result.rows[0].total_storage);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = File;
