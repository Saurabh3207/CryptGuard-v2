# CryptGuard v2.0 - Military-Grade Authentication Architecture

**Date:** November 10, 2025  
**Classification:** Security Architecture Specification  
**Purpose:** Define military-level authentication and access control

---

## 🎯 Security Philosophy

**Core Principle:** "Trust No One, Verify Everything"

**Security Levels:**
- **Level 1:** Consumer-grade (Dropbox, Google Drive)
- **Level 2:** Business-grade (Box.com, OneDrive Business)
- **Level 3:** Enterprise-grade (Most SaaS companies)
- **Level 4:** Government-grade (AWS GovCloud, Azure Government)
- **Level 5:** Military-grade (NSA, DoD requirements) ← **CryptGuard Target**

---

## 🔐 Multi-Layered Authentication System

### **Layer 1: Identity Verification**

#### 1.1 Password Requirements (NIST 800-63B Compliant)

```javascript
// Password Policy Configuration
const PASSWORD_POLICY = {
  minLength: 12,              // Minimum 12 characters (military standard)
  maxLength: 128,             // Support passphrases
  requireUppercase: true,     // At least 1 uppercase
  requireLowercase: true,     // At least 1 lowercase
  requireNumbers: true,       // At least 1 number
  requireSpecialChars: true,  // At least 1 special character
  
  // Advanced checks
  preventCommonPasswords: true,     // Check against 10M+ common passwords
  preventUserInfo: true,            // No username, email, name in password
  preventSequential: true,          // No "123456", "abcdef"
  preventRepeating: true,           // No "aaaaaa", "111111"
  preventKeyboardPatterns: true,    // No "qwerty", "asdfgh"
  
  // Strength scoring
  minimumStrength: 4,         // zxcvbn score (0-4, require 4)
  
  // Password history
  preventReuse: 10,           // Can't reuse last 10 passwords
  
  // Expiry (optional for military)
  expiryDays: 90,            // Force change every 90 days (configurable)
  expiryWarningDays: 14      // Warn 14 days before expiry
};

// Implementation
import zxcvbn from 'zxcvbn';
import { commonPasswords } from './common-passwords-10M';

const validatePassword = (password, userInfo) => {
  // 1. Length check
  if (password.length < 12 || password.length > 128) {
    throw new Error('Password must be 12-128 characters');
  }
  
  // 2. Character variety
  if (!/[A-Z]/.test(password)) throw new Error('Requires uppercase');
  if (!/[a-z]/.test(password)) throw new Error('Requires lowercase');
  if (!/[0-9]/.test(password)) throw new Error('Requires number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    throw new Error('Requires special character');
  }
  
  // 3. Common password check
  if (commonPasswords.has(password.toLowerCase())) {
    throw new Error('Password is too common');
  }
  
  // 4. User info check
  const userInfoWords = [
    userInfo.username,
    userInfo.email.split('@')[0],
    userInfo.firstName,
    userInfo.lastName
  ].filter(Boolean).map(w => w.toLowerCase());
  
  for (const word of userInfoWords) {
    if (password.toLowerCase().includes(word)) {
      throw new Error('Password cannot contain personal information');
    }
  }
  
  // 5. Pattern checks
  if (/(.)\1{3,}/.test(password)) {
    throw new Error('Password has too many repeating characters');
  }
  
  if (/(?:abc|bcd|cde|def|012|123|234|345|456|567|678|789)/i.test(password)) {
    throw new Error('Password contains sequential characters');
  }
  
  // 6. Strength check (zxcvbn)
  const strength = zxcvbn(password, userInfoWords);
  if (strength.score < 4) {
    throw new Error(`Password too weak: ${strength.feedback.suggestions.join('. ')}`);
  }
  
  return { valid: true, strength: strength.score };
};
```

#### 1.2 Password Hashing (Argon2id - Winner of Password Hashing Competition)

```javascript
import argon2 from 'argon2';

// Argon2id Configuration (Military-grade)
const ARGON2_CONFIG = {
  type: argon2.argon2id,      // Hybrid (memory-hard + CPU-hard)
  memoryCost: 65536,          // 64 MB memory (prevent GPU attacks)
  timeCost: 3,                // 3 iterations
  parallelism: 4,             // 4 threads
  hashLength: 32,             // 256-bit output
  saltLength: 16              // 128-bit salt
};

// Hash password
const hashPassword = async (password) => {
  try {
    const hash = await argon2.hash(password, ARGON2_CONFIG);
    
    // Store hash in database
    // Format: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
    return hash;
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

// Verify password
const verifyPassword = async (password, hash) => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
};

// Why Argon2id over bcrypt?
// - Memory-hard (prevents GPU/ASIC attacks)
// - Configurable memory and time costs
// - Side-channel attack resistant
// - Recommended by OWASP, NSA, NIST
```

#### 1.3 Email Verification (Prevent Fake Accounts)

```javascript
// Email verification flow
const emailVerificationFlow = {
  // 1. Generate cryptographic token
  token: crypto.randomBytes(32).toString('hex'),
  
  // 2. Set expiry (15 minutes)
  expiresAt: Date.now() + 15 * 60 * 1000,
  
  // 3. Hash token before storing (prevent token theft from DB)
  hashedToken: crypto.createHash('sha256').update(token).digest('hex'),
  
  // 4. Store in database
  // INSERT INTO email_verifications (user_id, token_hash, expires_at)
  
  // 5. Send email with verification link
  verificationLink: `https://cryptguard.com/verify-email?token=${token}`,
  
  // 6. User clicks link
  // 6a. Check token not expired
  // 6b. Hash provided token and compare with stored hash
  // 6c. Mark email as verified
  // 6d. Delete verification record (single use)
  
  // Security features:
  features: {
    singleUse: true,              // Token can only be used once
    timeExpiry: '15 minutes',     // Short expiry window
    hashedStorage: true,          // Token hash stored, not plaintext
    rateLimit: '3 per hour',      // Prevent spam
    ipTracking: true              // Log IP for fraud detection
  }
};
```

---

### **Layer 2: Multi-Factor Authentication (MFA)**

#### 2.1 TOTP (Time-Based One-Time Password) - Primary MFA

```javascript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Setup 2FA for user
const setup2FA = async (userId, userEmail) => {
  // 1. Generate secret (160-bit)
  const secret = speakeasy.generateSecret({
    name: 'CryptGuard',
    issuer: 'CryptGuard',
    length: 32,           // 160 bits
    symbols: true
  });
  
  // 2. Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  // 3. Generate backup codes (10 codes, single-use)
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  
  // 4. Hash backup codes before storing
  const hashedBackupCodes = backupCodes.map(code => 
    crypto.createHash('sha256').update(code).digest('hex')
  );
  
  // 5. Store in database (encrypted)
  await db.query(`
    INSERT INTO user_2fa (user_id, secret_encrypted, backup_codes_encrypted, enabled_at)
    VALUES (?, ?, ?, NOW())
  `, [
    userId,
    encrypt(secret.base32, masterKey),  // Encrypt secret
    encrypt(JSON.stringify(hashedBackupCodes), masterKey)
  ]);
  
  // 6. Return to user (ONLY SHOWN ONCE!)
  return {
    qrCode,              // For Google Authenticator, Authy, etc.
    secret: secret.base32,   // Manual entry
    backupCodes          // Emergency codes (printed/saved)
  };
};

// Verify 2FA token
const verify2FA = async (userId, token) => {
  // 1. Get user's 2FA secret from database
  const { secret_encrypted } = await db.query(
    'SELECT secret_encrypted FROM user_2fa WHERE user_id = ?',
    [userId]
  );
  
  if (!secret_encrypted) {
    throw new Error('2FA not enabled');
  }
  
  // 2. Decrypt secret
  const secret = decrypt(secret_encrypted, masterKey);
  
  // 3. Verify token (with time window)
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1           // Allow 30s clock skew
  });
  
  if (!verified) {
    // Check if it's a backup code
    return await verifyBackupCode(userId, token);
  }
  
  return verified;
};

// Verify backup code (single-use)
const verifyBackupCode = async (userId, code) => {
  // Hash provided code
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  
  // Get stored backup codes
  const { backup_codes_encrypted } = await db.query(
    'SELECT backup_codes_encrypted FROM user_2fa WHERE user_id = ?',
    [userId]
  );
  
  const backupCodes = JSON.parse(decrypt(backup_codes_encrypted, masterKey));
  
  // Check if code exists and not used
  const codeIndex = backupCodes.findIndex(c => c === hashedCode);
  
  if (codeIndex === -1) {
    return false; // Invalid code
  }
  
  // Mark code as used (remove from array)
  backupCodes.splice(codeIndex, 1);
  
  // Update database
  await db.query(
    'UPDATE user_2fa SET backup_codes_encrypted = ? WHERE user_id = ?',
    [encrypt(JSON.stringify(backupCodes), masterKey), userId]
  );
  
  return true;
};
```

#### 2.2 Hardware Security Keys (FIDO2/WebAuthn) - Premium MFA

```javascript
// Support for YubiKey, Google Titan, etc.
import { 
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';

// Register hardware key
const registerSecurityKey = async (userId, userEmail) => {
  // 1. Generate registration options
  const options = generateRegistrationOptions({
    rpName: 'CryptGuard',
    rpID: 'cryptguard.com',
    userID: userId,
    userName: userEmail,
    timeout: 60000,
    attestationType: 'direct',    // Verify device authenticity
    authenticatorSelection: {
      authenticatorAttachment: 'cross-platform',  // Physical keys only
      requireResidentKey: false,
      userVerification: 'preferred'
    }
  });
  
  // 2. Send to client
  return options;
};

// Verify hardware key
const verifySecurityKey = async (userId, response) => {
  // Verify cryptographic signature from hardware key
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: 'https://cryptguard.com',
    expectedRPID: 'cryptguard.com',
    authenticator: storedAuthenticator
  });
  
  return verification.verified;
};

// Why Hardware Keys?
// - Phishing resistant (challenge-response)
// - No shared secrets (private key never leaves device)
// - Approved by NIST for government use
// - Used by Google, Facebook, GitHub for employees
```

#### 2.3 SMS/Voice Backup (Last Resort Only)

```javascript
// SMS 2FA (NIST deprecated, but users want it)
import twilio from 'twilio';

const sendSMS2FA = async (phoneNumber) => {
  // Generate 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  
  // Hash and store (5-minute expiry)
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  await db.query(`
    INSERT INTO sms_verifications (phone, code_hash, expires_at)
    VALUES (?, ?, NOW() + INTERVAL 5 MINUTE)
  `, [phoneNumber, hashedCode]);
  
  // Send via Twilio
  await twilioClient.messages.create({
    body: `Your CryptGuard verification code: ${code}. Valid for 5 minutes. Never share this code.`,
    to: phoneNumber,
    from: process.env.TWILIO_PHONE
  });
  
  // Rate limit: 3 per hour per phone number
  // Why SMS is weak:
  // - SIM swapping attacks
  // - SS7 protocol vulnerabilities
  // - Carrier insecurity
  // - NIST deprecated in 2016
  // Use only as backup, not primary!
};
```

---

### **Layer 3: JWT Token Security**

#### 3.1 Access Token (Short-lived)

```javascript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate access token (15 minutes)
const generateAccessToken = (user) => {
  const payload = {
    sub: user.id,                   // Subject (user ID)
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    
    // Security claims
    iat: Math.floor(Date.now() / 1000),     // Issued at
    exp: Math.floor(Date.now() / 1000) + 900, // Expires in 15 min
    jti: crypto.randomUUID(),               // JWT ID (prevent replay)
    iss: 'cryptguard.com',                  // Issuer
    aud: 'cryptguard.com'                   // Audience
  };
  
  // Sign with RS256 (RSA + SHA-256)
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',          // Asymmetric (public key can't create tokens)
    keyid: process.env.KEY_ID    // Key rotation support
  });
  
  return token;
};

// Why RS256 over HS256?
// - Public key verification (microservices can verify without secret)
// - Key rotation easier
// - Prevents "alg: none" attack
// - More secure for distributed systems
```

#### 3.2 Refresh Token (Long-lived, Rotating)

```javascript
// Generate refresh token (7 days, but rotates on use)
const generateRefreshToken = async (userId, deviceFingerprint) => {
  // 1. Generate cryptographically secure token
  const token = crypto.randomBytes(64).toString('base64url');
  
  // 2. Hash token before storing
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // 3. Create token family (detect token theft)
  const family = crypto.randomUUID();
  
  // 4. Store in database
  await db.query(`
    INSERT INTO refresh_tokens (
      user_id,
      token_hash,
      family,
      device_fingerprint,
      ip_address,
      user_agent,
      expires_at,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW() + INTERVAL 7 DAY, NOW())
  `, [userId, tokenHash, family, deviceFingerprint, req.ip, req.headers['user-agent']]);
  
  return { token, family };
};

// Rotating refresh tokens (prevent token theft)
const refreshAccessToken = async (refreshToken) => {
  // 1. Hash provided token
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  // 2. Find token in database
  const storedToken = await db.query(`
    SELECT * FROM refresh_tokens 
    WHERE token_hash = ? AND revoked = FALSE
  `, [tokenHash]);
  
  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }
  
  // 3. Check expiry
  if (new Date() > storedToken.expires_at) {
    throw new Error('Refresh token expired');
  }
  
  // 4. Check device fingerprint (detect token theft)
  const currentFingerprint = generateDeviceFingerprint(req);
  if (currentFingerprint !== storedToken.device_fingerprint) {
    // Possible token theft! Revoke entire family
    await revokeTokenFamily(storedToken.family);
    throw new Error('Token theft detected. Please login again.');
  }
  
  // 5. Revoke old token
  await db.query(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE id = ?',
    [storedToken.id]
  );
  
  // 6. Generate NEW refresh token (rotation)
  const newRefreshToken = await generateRefreshToken(
    storedToken.user_id,
    storedToken.device_fingerprint
  );
  
  // 7. Generate new access token
  const newAccessToken = generateAccessToken(await getUserById(storedToken.user_id));
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken.token
  };
};

// Detect token theft via token family
const revokeTokenFamily = async (family) => {
  // If token used after being rotated, revoke entire family
  await db.query(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE family = ?',
    [family]
  );
  
  // Alert user
  await sendSecurityAlert(userId, 'Possible token theft detected. All sessions revoked.');
};
```

#### 3.3 Token Storage (Secure Cookies)

```javascript
// Store tokens in HttpOnly cookies (not localStorage!)
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,           // Not accessible via JavaScript (XSS protection)
    secure: true,             // HTTPS only
    sameSite: 'strict',       // CSRF protection
    maxAge: 15 * 60 * 1000,   // 15 minutes
    path: '/',
    domain: '.cryptguard.com' // Works on all subdomains
  });
  
  // Refresh token cookie (separate!)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    path: '/api/auth/refresh',         // Only sent to refresh endpoint
    domain: '.cryptguard.com'
  });
};

// Why HttpOnly cookies over localStorage?
// localStorage vulnerabilities:
// - XSS attacks can steal tokens
// - Accessible from any script
// - No expiry enforcement
// - No same-site protection

// HttpOnly cookies:
// - Immune to XSS (JavaScript can't read)
// - Browser enforces expiry
// - SameSite prevents CSRF
// - Secure flag enforces HTTPS
```

---

### **Layer 4: Device Fingerprinting & Risk Assessment**

```javascript
// Generate device fingerprint (detect suspicious logins)
const generateDeviceFingerprint = (req) => {
  const components = [
    req.headers['user-agent'],
    req.headers['accept-language'],
    req.headers['accept-encoding'],
    req.ip,
    req.headers['sec-ch-ua'],           // Browser info
    req.headers['sec-ch-ua-platform']   // OS info
  ];
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
  
  return fingerprint;
};

// Risk-based authentication
const assessLoginRisk = async (userId, req) => {
  let riskScore = 0;
  
  // 1. Check known devices
  const knownDevice = await db.query(`
    SELECT * FROM known_devices 
    WHERE user_id = ? AND fingerprint = ?
  `, [userId, generateDeviceFingerprint(req)]);
  
  if (!knownDevice) {
    riskScore += 30; // New device
  }
  
  // 2. Check location (IP geolocation)
  const currentLocation = await getGeolocation(req.ip);
  const lastLocation = await getLastLoginLocation(userId);
  
  if (currentLocation.country !== lastLocation.country) {
    riskScore += 40; // Different country
  }
  
  // 3. Check impossible travel
  const timeSinceLastLogin = Date.now() - lastLocation.timestamp;
  const distance = calculateDistance(currentLocation, lastLocation);
  const maxPossibleSpeed = distance / (timeSinceLastLogin / 3600); // km/h
  
  if (maxPossibleSpeed > 800) { // Faster than airplane
    riskScore += 50; // Impossible travel detected
  }
  
  // 4. Check login time (unusual hours)
  const hour = new Date().getHours();
  const usualHours = await getUserUsualLoginHours(userId);
  
  if (!usualHours.includes(hour)) {
    riskScore += 10; // Unusual time
  }
  
  // 5. Check failed login attempts
  const recentFailures = await getRecentFailedLogins(userId);
  if (recentFailures > 3) {
    riskScore += 20; // Multiple failures
  }
  
  // Risk levels
  if (riskScore < 20) return { risk: 'low', action: 'allow' };
  if (riskScore < 50) return { risk: 'medium', action: 'require_2fa' };
  if (riskScore < 80) return { risk: 'high', action: 'require_email_verification' };
  return { risk: 'critical', action: 'block_and_alert' };
};
```

---

## 🛡️ Session Security

### **1. Session Management**

```javascript
// Secure session configuration
const SESSION_CONFIG = {
  maxAge: 15 * 60 * 1000,          // 15 minutes
  absoluteMaxAge: 8 * 60 * 60 * 1000,  // 8 hours (hard limit)
  
  // Activity tracking
  trackActivity: true,
  extendOnActivity: true,
  activityCheckInterval: 60000,     // Check every 1 minute
  
  // Security features
  enforceIpConsistency: true,       // Same IP required
  enforceFingerprintConsistency: true,  // Same device required
  maxConcurrentSessions: 5,         // Max 5 devices
  
  // Warnings
  expiryWarning: 60000,             // Warn 1 min before expiry
  
  // Limits
  maxSessionsPerUser: 10,           // Total sessions across all devices
  revokeOldest: true                // Auto-revoke oldest if limit reached
};

// Store session in PostgreSQL (not in JWT!)
const createSession = async (userId, deviceFingerprint, req) => {
  const sessionId = crypto.randomUUID();
  
  await db.query(`
    INSERT INTO sessions (
      id,
      user_id,
      device_fingerprint,
      ip_address,
      user_agent,
      created_at,
      last_activity,
      expires_at,
      absolute_expires_at
    ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW() + INTERVAL 15 MINUTE, NOW() + INTERVAL 8 HOUR)
  `, [
    sessionId,
    userId,
    deviceFingerprint,
    req.ip,
    req.headers['user-agent']
  ]);
  
  return sessionId;
};

// Validate session on every request
const validateSession = async (sessionId, req) => {
  const session = await db.query(
    'SELECT * FROM sessions WHERE id = ? AND revoked = FALSE',
    [sessionId]
  );
  
  if (!session) {
    throw new Error('Invalid session');
  }
  
  // Check expiry
  if (new Date() > session.expires_at) {
    throw new Error('Session expired');
  }
  
  // Check absolute expiry (can't be extended)
  if (new Date() > session.absolute_expires_at) {
    throw new Error('Maximum session duration reached');
  }
  
  // Check IP consistency
  if (SESSION_CONFIG.enforceIpConsistency && req.ip !== session.ip_address) {
    await revokeSession(sessionId);
    throw new Error('IP address changed. Session revoked for security.');
  }
  
  // Check device fingerprint
  const currentFingerprint = generateDeviceFingerprint(req);
  if (SESSION_CONFIG.enforceFingerprintConsistency && 
      currentFingerprint !== session.device_fingerprint) {
    await revokeSession(sessionId);
    throw new Error('Device changed. Session revoked for security.');
  }
  
  // Update last activity and extend expiry
  await db.query(`
    UPDATE sessions 
    SET last_activity = NOW(),
        expires_at = NOW() + INTERVAL 15 MINUTE
    WHERE id = ?
  `, [sessionId]);
  
  return session;
};
```

### **2. Concurrent Session Management**

```javascript
// List user's active sessions
const getUserSessions = async (userId) => {
  return await db.query(`
    SELECT 
      id,
      device_fingerprint,
      ip_address,
      user_agent,
      created_at,
      last_activity,
      is_current
    FROM sessions
    WHERE user_id = ? AND revoked = FALSE
    ORDER BY last_activity DESC
  `, [userId]);
};

// Revoke specific session
const revokeSession = async (sessionId) => {
  await db.query(
    'UPDATE sessions SET revoked = TRUE, revoked_at = NOW() WHERE id = ?',
    [sessionId]
  );
};

// Revoke all sessions except current (force re-login everywhere)
const revokeAllOtherSessions = async (userId, currentSessionId) => {
  await db.query(
    'UPDATE sessions SET revoked = TRUE WHERE user_id = ? AND id != ?',
    [userId, currentSessionId]
  );
};

// Auto-revoke inactive sessions (cron job)
const revokeInactiveSessions = async () => {
  await db.query(`
    UPDATE sessions 
    SET revoked = TRUE, revoked_at = NOW()
    WHERE last_activity < NOW() - INTERVAL 30 DAY
  `);
};
```

---

**[Continued in next part due to length...]**

**Status:** Part 1 of 3 complete (Authentication layers defined)

**Next parts:**
- Part 2: CIA Triad Implementation
- Part 3: Storage Options & On-Premises Solutions

**Should I continue with Part 2?**
