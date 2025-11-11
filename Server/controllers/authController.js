const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const pool = require('../config/database');
const logger = require('../utils/logger');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(12).required(),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  masterKeyEncrypted: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Generate JWT tokens
const generateTokens = (userId, email) => {
  const accessToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }

    const { email, password, firstName, lastName, masterKeyEncrypted } = value;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'An account with this email already exists'
        }
      });
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64MB
      timeCost: 3,
      parallelism: 4
    });

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, master_key_encrypted)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, email_verified, created_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName, masterKeyEncrypted]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Store refresh token (hashed)
    const refreshTokenHash = await argon2.hash(refreshToken);
    await pool.query(
      `INSERT INTO sessions (user_id, token_hash, refresh_token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days')`,
      [
        user.id,
        await argon2.hash(accessToken),
        refreshTokenHash,
        req.ip,
        req.headers['user-agent']
      ]
    );

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          emailVerified: user.email_verified
        },
        accessToken,
        refreshToken
      },
      message: 'Account created successfully'
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create account'
      }
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }

    const { email, password } = value;

    // Find user
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, email_verified, mfa_enabled, mfa_secret
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await argon2.verify(user.password_hash, password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if 2FA is enabled
    if (user.mfa_enabled) {
      return res.status(200).json({
        success: true,
        data: {
          needsTwoFactor: true,
          userId: user.id
        },
        message: 'Please provide your 2FA code'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Store refresh token
    const refreshTokenHash = await argon2.hash(refreshToken);
    await pool.query(
      `INSERT INTO sessions (user_id, token_hash, refresh_token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days')`,
      [
        user.id,
        await argon2.hash(accessToken),
        refreshTokenHash,
        req.ip,
        req.headers['user-agent']
      ]
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          emailVerified: user.email_verified
        },
        accessToken,
        refreshToken
      },
      message: 'Login successful'
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Login failed'
      }
    });
  }
};

// Refresh tokens
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Refresh token is required'
        }
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token exists in database
    const sessions = await pool.query(
      'SELECT id, user_id FROM sessions WHERE user_id = $1 AND expires_at > NOW()',
      [decoded.userId]
    );

    if (sessions.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token'
        }
      });
    }

    // Get user email
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [decoded.userId]
    );

    // Generate new tokens
    const tokens = generateTokens(decoded.userId, userResult.rows[0].email);

    // Update session with new token hashes
    const newRefreshTokenHash = await argon2.hash(tokens.refreshToken);
    await pool.query(
      `UPDATE sessions 
       SET token_hash = $1, refresh_token_hash = $2, expires_at = NOW() + INTERVAL '7 days'
       WHERE user_id = $3`,
      [await argon2.hash(tokens.accessToken), newRefreshTokenHash, decoded.userId]
    );

    res.status(200).json({
      success: true,
      data: tokens,
      message: 'Tokens refreshed successfully'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token'
        }
      });
    }

    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Token refresh failed'
      }
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    const userId = req.user.userId; // From authenticateToken middleware

    // Delete user sessions
    await pool.query(
      'DELETE FROM sessions WHERE user_id = $1',
      [userId]
    );

    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Logout failed'
      }
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, email, first_name, last_name, email_verified, mfa_enabled, created_at, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          emailVerified: user.email_verified,
          mfaEnabled: user.mfa_enabled,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at
        }
      }
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user'
      }
    });
  }
};
