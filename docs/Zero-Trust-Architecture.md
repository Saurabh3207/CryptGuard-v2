# CryptGuard v2.0 - Zero-Trust Security Architecture

**Date:** November 10, 2025  
**Classification:** Security Architecture  
**Principle:** "Never Trust, Always Verify"

---

## 🎯 What is Zero-Trust?

**Traditional Security Model (Perimeter-Based):**
```
     Firewall
  ┌────────────┐
  │  TRUSTED   │ ← Inside network = trusted
  │  (no checks)│
  │            │
  └────────────┘
       ↑
  ┌────────────┐
  │  UNTRUSTED │ ← Outside network = untrusted
  └────────────┘
```

**Problem:** Once an attacker breaches the perimeter, they have free reign inside!

**Zero-Trust Model:**
```
    Every Request
  ┌────────────┐
  │ 1. Verify  │ ← Who are you? (Authentication)
  │ 2. Validate│ ← What can you access? (Authorization)
  │ 3. Monitor │ ← What are you doing? (Audit)
  └────────────┘
       ↓
  No implicit trust!
```

---

## 📋 Zero-Trust Principles

### **1. Verify Explicitly**
**Always authenticate and authorize based on all available data points**

```javascript
// Every API request goes through verification
const verifyRequest = async (req, res, next) => {
  // 1. JWT token valid?
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 2. User still exists?
  const user = await db.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
  if (!user || user.deleted_at) return res.status(401).json({ error: 'User not found' });
  
  // 3. Session still valid?
  const session = await db.query('SELECT * FROM sessions WHERE token_hash = ?', [hashToken(token)]);
  if (!session || session.expires_at < new Date()) {
    return res.status(401).json({ error: 'Session expired' });
  }
  
  // 4. Device fingerprint matches?
  const currentFingerprint = generateFingerprint(req);
  if (session.device_fingerprint !== currentFingerprint) {
    await logSecurityEvent('DEVICE_MISMATCH', user.id, req);
    return res.status(401).json({ error: 'Device mismatch' });
  }
  
  // 5. IP address suspicious?
  const riskScore = await calculateRiskScore(user.id, req.ip);
  if (riskScore > 80) {
    await logSecurityEvent('HIGH_RISK_IP', user.id, req);
    return res.status(403).json({ error: 'Access denied - high risk' });
  }
  
  // 6. Rate limit not exceeded?
  const rateLimitKey = `ratelimit:${user.id}`;
  const requests = await redis.incr(rateLimitKey);
  if (requests === 1) await redis.expire(rateLimitKey, 60);
  if (requests > 100) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // All checks passed!
  req.user = user;
  next();
};

app.use('/api/*', verifyRequest);
```

### **2. Least Privilege Access**
**Users get minimum permissions needed - no more, no less**

```javascript
// Role-Based Access Control (RBAC)
const ROLES = {
  VIEWER: {
    permissions: ['file:read']
  },
  EDITOR: {
    permissions: ['file:read', 'file:write', 'file:delete']
  },
  ADMIN: {
    permissions: ['file:read', 'file:write', 'file:delete', 'user:manage', 'org:manage']
  },
  OWNER: {
    permissions: ['*'] // All permissions
  }
};

// Check permission before every action
const requirePermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user;
    const userRole = await db.query('SELECT role FROM users WHERE id = ?', [user.id]);
    
    const userPermissions = ROLES[userRole.role].permissions;
    
    // Check if user has permission
    if (!userPermissions.includes(permission) && !userPermissions.includes('*')) {
      await logSecurityEvent('PERMISSION_DENIED', user.id, { permission, action: req.path });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage
app.get('/api/files/:id', verifyRequest, requirePermission('file:read'), getFile);
app.delete('/api/files/:id', verifyRequest, requirePermission('file:delete'), deleteFile);
app.post('/api/users', verifyRequest, requirePermission('user:manage'), createUser);
```

### **3. Assume Breach**
**Design as if attackers are already inside**

```javascript
// Micro-segmentation: Isolate services
const SERVICE_NETWORK_POLICIES = {
  'web-server': {
    canAccess: ['api-server'],
    cannotAccess: ['database', 'redis', 's3']
  },
  'api-server': {
    canAccess: ['database', 'redis', 's3'],
    cannotAccess: ['admin-panel']
  },
  'admin-panel': {
    canAccess: ['api-server'],
    cannotAccess: ['database'] // No direct DB access!
  }
};

// If web-server is compromised, attacker can't directly access DB
```

**Data Encryption Everywhere:**
```javascript
// Even if attacker gets database dump, data is encrypted
const encryptedData = {
  file_name: 'aGVsbG8udHh0', // Encrypted
  file_content_cid: 'Qm...', // IPFS CID points to encrypted file
  encryption_key: 'U2FsdGVkX1...', // Encrypted with user's password-derived key
  owner_id: '123e4567-e89b-12d3-a456-426614174000' // UUID (no PII)
};

// Without user's password, even database admin can't decrypt files!
```

---

## 🔐 Zero-Trust Implementation in CryptGuard

### **Architecture Diagram:**
```
┌────────────────────────────────────────────────────────────┐
│                       User's Browser                       │
│  - Client-side encryption (never trust server!)            │
└────────────────────────┬───────────────────────────────────┘
                         │ HTTPS (TLS 1.3 with certificate pinning)
                         ↓
┌────────────────────────────────────────────────────────────┐
│                    Load Balancer (WAF)                     │
│  - DDoS protection                                          │
│  - Rate limiting                                            │
│  - IP blocklist/allowlist                                  │
└────────────────────────┬───────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │   API    │   │   API    │   │   API    │
   │ Server 1 │   │ Server 2 │   │ Server 3 │
   └────┬─────┘   └────┬─────┘   └────┬─────┘
        │              │              │
        │  1. Authenticate (JWT)       │
        │  2. Authorize (RBAC)         │
        │  3. Validate input           │
        │  4. Encrypt data             │
        │  5. Audit log                │
        │              │              │
        └──────────────┼──────────────┘
                       ↓
          ┌────────────────────────┐
          │   Service Mesh         │
          │   (mTLS between        │
          │    services)           │
          └────────────┬───────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │PostgreSQL│   │   Redis  │   │AWS S3 KMS│
   │(encrypted│   │ (session)│   │(encrypted│
   │  at rest)│   └──────────┘   │  storage)│
   └──────────┘                  └──────────┘
```

### **Layer 1: Identity & Access Management**

```javascript
// Multi-factor authentication required for sensitive actions
const requireMFA = async (req, res, next) => {
  const user = req.user;
  
  // Check if MFA is enabled
  const mfaEnabled = await db.query('SELECT mfa_enabled FROM users WHERE id = ?', [user.id]);
  
  if (!mfaEnabled) {
    return res.status(403).json({ 
      error: 'MFA required for this action',
      action: 'enable_mfa_first'
    });
  }
  
  // Check if recent MFA verification (< 5 minutes ago)
  const recentMFA = await redis.get(`mfa:verified:${user.id}`);
  if (!recentMFA) {
    return res.status(403).json({ 
      error: 'MFA verification required',
      action: 'verify_mfa'
    });
  }
  
  next();
};

// Sensitive actions require MFA
app.delete('/api/account', verifyRequest, requireMFA, deleteAccount);
app.post('/api/admin/users', verifyRequest, requireMFA, createUser);
app.get('/api/audit-logs', verifyRequest, requireMFA, getAuditLogs);
```

### **Layer 2: Device Trust**

```javascript
// Device registration
app.post('/api/devices/register', verifyRequest, async (req, res) => {
  const device = {
    user_id: req.user.id,
    device_name: req.body.device_name, // "John's iPhone"
    fingerprint: generateFingerprint(req),
    trusted: false, // Requires email confirmation
    registered_at: new Date()
  };
  
  await db.query('INSERT INTO devices SET ?', device);
  
  // Send email confirmation
  await sendEmail({
    to: req.user.email,
    subject: 'New Device Registered',
    body: `A new device "${device.device_name}" was registered. If this wasn't you, revoke access immediately.`
  });
  
  res.json({ message: 'Device registered. Check email to confirm.' });
});

// Only allow trusted devices for sensitive actions
const requireTrustedDevice = async (req, res, next) => {
  const fingerprint = generateFingerprint(req);
  const device = await db.query(`
    SELECT * FROM devices 
    WHERE user_id = ? AND fingerprint = ? AND trusted = true
  `, [req.user.id, fingerprint]);
  
  if (!device) {
    return res.status(403).json({ 
      error: 'Untrusted device',
      action: 'register_device'
    });
  }
  
  next();
};

app.get('/api/files/download/:id', verifyRequest, requireTrustedDevice, downloadFile);
```

### **Layer 3: Network Segmentation**

```javascript
// Service-to-service authentication with mutual TLS (mTLS)
const mTLSConfig = {
  // API server certificate
  cert: fs.readFileSync('/etc/certs/api-server.crt'),
  key: fs.readFileSync('/etc/certs/api-server.key'),
  
  // Trust only our CA (no public CAs!)
  ca: fs.readFileSync('/etc/certs/ca.crt'),
  
  // Require client certificates
  requestCert: true,
  rejectUnauthorized: true
};

// Internal service calls use mTLS
const callDatabaseService = async (query) => {
  const response = await axios.post('https://database-service:5432/query', 
    { query },
    { httpsAgent: new https.Agent(mTLSConfig) }
  );
  return response.data;
};

// External calls (to S3, etc.) go through proxy with egress filtering
const callS3 = async (operation) => {
  // Only allow specific S3 operations
  const ALLOWED_OPERATIONS = ['PutObject', 'GetObject', 'DeleteObject'];
  if (!ALLOWED_OPERATIONS.includes(operation.type)) {
    throw new Error(`Operation ${operation.type} not allowed`);
  }
  
  return await s3Client.send(operation);
};
```

### **Layer 4: Data Security**

```javascript
// Encryption at every layer
const dataLifecycle = {
  // 1. Client-side encryption (before upload)
  clientEncryption: async (file, userPassword) => {
    const key = await deriveKey(userPassword); // PBKDF2
    const encrypted = await encryptAES256(file, key);
    return encrypted;
  },
  
  // 2. Transport encryption (HTTPS)
  transport: 'TLS 1.3',
  
  // 3. Server-side encryption (at rest)
  serverEncryption: async (encryptedFile) => {
    // File is ALREADY encrypted by client!
    // We add another layer (defense in depth)
    const orgKey = await getOrganizationKey(req.user.org_id);
    const doubleEncrypted = await encryptAES256(encryptedFile, orgKey);
    return doubleEncrypted;
  },
  
  // 4. Storage encryption (AWS S3 KMS)
  storageEncryption: 'AES-256 (AWS managed)',
  
  // Total: 3 layers of encryption!
};

// Even if one layer is compromised, attacker still can't read data
```

### **Layer 5: Continuous Monitoring**

```javascript
// Real-time anomaly detection
const detectAnomalies = async (userId, action) => {
  // Build user behavior profile
  const profile = await db.query(`
    SELECT 
      AVG(files_uploaded_per_day) as avg_uploads,
      AVG(data_transferred_per_day) as avg_data,
      STDDEV(files_uploaded_per_day) as stddev_uploads
    FROM user_activity_daily
    WHERE user_id = ? AND date > NOW() - INTERVAL 30 DAY
  `, [userId]);
  
  // Compare current activity
  const todayActivity = await db.query(`
    SELECT COUNT(*) as uploads, SUM(file_size) as data
    FROM files
    WHERE user_id = ? AND created_at > CURDATE()
  `, [userId]);
  
  // Detect anomalies (> 3 standard deviations = 99.7% confidence)
  const uploadAnomaly = (todayActivity.uploads - profile.avg_uploads) / profile.stddev_uploads;
  
  if (uploadAnomaly > 3) {
    // Anomaly detected!
    await logSecurityEvent('ANOMALY_DETECTED', userId, {
      type: 'unusual_upload_volume',
      expected: profile.avg_uploads,
      actual: todayActivity.uploads,
      stddev: uploadAnomaly
    });
    
    // Take action
    if (uploadAnomaly > 5) {
      // Extreme anomaly - suspend account
      await db.query('UPDATE users SET suspended = true WHERE id = ?', [userId]);
      await sendAlertToAdmin(`User ${userId} suspended due to extreme anomaly`);
    } else {
      // Moderate anomaly - require MFA
      await redis.del(`mfa:verified:${userId}`);
      await sendEmail({
        to: user.email,
        subject: 'Unusual Activity Detected',
        body: 'We detected unusual activity. Please verify with MFA.'
      });
    }
  }
};

// Run anomaly detection on every file upload
app.post('/api/files/upload', verifyRequest, async (req, res) => {
  await detectAnomalies(req.user.id, 'file_upload');
  
  // Continue with upload...
});
```

---

## 🎯 Zero-Trust Benefits for CryptGuard

### **1. Breach Containment**
```
Traditional:
  Attacker breaches perimeter → Full access to everything

Zero-Trust:
  Attacker breaches perimeter → Still needs to:
    - Break encryption (AES-256 = impossible)
    - Bypass MFA (hardware keys = phishing-resistant)
    - Steal session tokens (rotated every 15 minutes)
    - Match device fingerprint (unique per device)
    - Evade anomaly detection (ML flags unusual behavior)
    
  Result: Breach contained to single account/device!
```

### **2. Compliance**
```
✅ HIPAA: "No device or media controls" → Zero-trust device trust
✅ GDPR: "Appropriate security measures" → Encryption + access controls
✅ SOC 2: "Logical access controls" → RBAC + MFA
✅ ISO 27001: "Access control policy" → Least privilege
```

### **3. Insider Threat Protection**
```
Malicious employee can't:
  ❌ Access other users' files (encrypted with user's key)
  ❌ Modify audit logs (immutable, chained)
  ❌ Escalate privileges (RBAC enforced at every layer)
  ❌ Exfiltrate data (anomaly detection flags mass downloads)
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Foundation (Weeks 1-4)**
```
✅ Implement JWT authentication with rotation
✅ Add device fingerprinting
✅ Set up RBAC with permissions
✅ Enable audit logging
✅ Basic rate limiting
```

### **Phase 2: Hardening (Weeks 5-8)**
```
✅ Add MFA (TOTP + hardware keys)
✅ Implement risk-based authentication
✅ Set up anomaly detection
✅ Add session management
✅ Encrypt data at rest
```

### **Phase 3: Maturity (Weeks 9-12)**
```
✅ Deploy service mesh with mTLS
✅ Add network segmentation
✅ Implement device trust
✅ Set up SIEM (Security Information and Event Management)
✅ Penetration testing
```

### **Phase 4: Optimization (Ongoing)**
```
✅ Tune anomaly detection models
✅ Optimize rate limits
✅ Regular security audits
✅ Update threat models
```

---

## 📊 Monitoring & Alerting

```javascript
// Security dashboard metrics
const SECURITY_METRICS = {
  // Real-time
  'active_sessions': 'Current active sessions',
  'failed_login_attempts_per_minute': 'Failed logins (last 60s)',
  'high_risk_requests_per_minute': 'High-risk requests (last 60s)',
  'anomalies_detected_per_hour': 'Anomalies detected (last 60 min)',
  
  // Daily
  'unique_devices_per_day': 'Unique devices accessed',
  'mfa_challenges_per_day': 'MFA challenges issued',
  'blocked_requests_per_day': 'Requests blocked',
  
  // Weekly
  'new_devices_registered_per_week': 'New devices registered',
  'accounts_suspended_per_week': 'Accounts suspended',
  'security_incidents_per_week': 'Security incidents'
};

// Alert thresholds
const ALERT_THRESHOLDS = {
  'failed_logins': { warning: 10, critical: 50 }, // per minute
  'high_risk_requests': { warning: 5, critical: 20 }, // per minute
  'anomalies': { warning: 3, critical: 10 }, // per hour
  'security_incidents': { warning: 1, critical: 5 } // per day
};

// Automated response
const handleSecurityAlert = async (metric, value, threshold) => {
  if (value >= threshold.critical) {
    // Critical: Page on-call engineer
    await pagerduty.trigger({
      severity: 'critical',
      summary: `${metric} exceeded critical threshold`,
      details: { value, threshold: threshold.critical }
    });
    
    // Activate defense mode
    await activateDefenseMode(); // e.g., stricter rate limits
  } else if (value >= threshold.warning) {
    // Warning: Slack notification
    await slack.send({
      channel: '#security-alerts',
      text: `⚠️ ${metric} exceeded warning threshold: ${value}/${threshold.warning}`
    });
  }
};
```

---

## 🎓 Team Training

**All engineers must complete:**
- [ ] Zero-Trust principles training (2 hours)
- [ ] Secure coding practices (4 hours)
- [ ] OWASP Top 10 vulnerabilities (2 hours)
- [ ] Incident response procedures (2 hours)
- [ ] Hands-on security labs (4 hours)

**Quarterly:**
- [ ] Phishing simulation (test click rate)
- [ ] Tabletop exercises (practice incident response)
- [ ] Security architecture review
- [ ] Threat modeling updates

---

## ✅ Zero-Trust Checklist

**Identity:**
- [x] Multi-factor authentication (TOTP + hardware keys)
- [x] Password policy (NIST 800-63B compliant)
- [x] Session management (15-min timeout)
- [x] Device fingerprinting
- [x] Risk-based authentication

**Network:**
- [x] TLS 1.3 with certificate pinning
- [x] Service mesh with mTLS
- [x] Network segmentation
- [x] Egress filtering
- [x] DDoS protection

**Data:**
- [x] Encryption at rest (AES-256)
- [x] Encryption in transit (TLS 1.3)
- [x] Client-side encryption
- [x] Key management (HSM/KMS)
- [x] Data classification

**Workload:**
- [x] RBAC (role-based access control)
- [x] Least privilege
- [x] Container security
- [x] Secrets management
- [x] Vulnerability scanning

**Visibility:**
- [x] Centralized logging
- [x] Audit trails (immutable)
- [x] Anomaly detection
- [x] SIEM integration
- [x] Real-time dashboards

**Automation:**
- [x] Automated incident response
- [x] Auto-scaling defense
- [x] Threat intelligence feeds
- [x] Continuous compliance monitoring
- [x] Automated patching

---

**Result: Military-grade security where EVERY request is challenged, EVERY user is verified, and EVERY action is audited!**

Last Updated: November 10, 2025
