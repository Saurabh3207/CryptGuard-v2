# CryptGuard v2.0 - CIA Triad & Compliance Framework

**Date:** November 10, 2025  
**Classification:** Security Implementation Guide  
**Purpose:** Implement Confidentiality, Integrity, Availability + Compliance

---

## 🎯 CIA Triad Overview

The CIA Triad is the foundation of information security:

```
        ┌─────────────────┐
        │ CONFIDENTIALITY │
        │  (Encryption)   │
        └────────┬────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
┌────▼────────┐      ┌───────▼──────┐
│  INTEGRITY  │      │ AVAILABILITY │
│  (Hashing)  │      │ (Redundancy) │
└─────────────┘      └──────────────┘
```

**All three must be achieved for military-grade security!**

---

## 🔐 Part 1: CONFIDENTIALITY

**Goal:** Ensure only authorized parties can access data

### **1.1 Data Classification**

```javascript
// Classify data by sensitivity
const DATA_CLASSIFICATIONS = {
  PUBLIC: {
    level: 0,
    encryption: 'optional',
    examples: ['marketing materials', 'public documents']
  },
  
  INTERNAL: {
    level: 1,
    encryption: 'recommended',
    examples: ['employee handbook', 'internal memos']
  },
  
  CONFIDENTIAL: {
    level: 2,
    encryption: 'required',
    examples: ['contracts', 'financial data', 'client info']
  },
  
  RESTRICTED: {
    level: 3,
    encryption: 'required + MFA',
    examples: ['trade secrets', 'legal privileged docs', 'PHI']
  },
  
  TOP_SECRET: {
    level: 4,
    encryption: 'required + MFA + HSM',
    examples: ['classified government', 'defense contracts']
  }
};

// Apply encryption based on classification
const applyEncryptionPolicy = (file, classification) => {
  switch (classification) {
    case 'PUBLIC':
      // No encryption needed
      return file;
      
    case 'INTERNAL':
    case 'CONFIDENTIAL':
      // Standard AES-256 encryption
      return encryptAES256(file, userKey);
      
    case 'RESTRICTED':
      // AES-256 + require MFA for access
      return {
        encrypted: encryptAES256(file, userKey),
        mfaRequired: true
      };
      
    case 'TOP_SECRET':
      // AES-256 + HSM-backed keys + audit every access
      return {
        encrypted: encryptWithHSM(file, hsmKey),
        mfaRequired: true,
        auditRequired: true,
        accessApprovalRequired: true
      };
  }
};
```

### **1.2 Encryption at Rest (Storage)**

```javascript
// Multi-layer encryption
const encryptFileForStorage = (file, userId) => {
  // Layer 1: User-specific encryption (client-side)
  const userKey = deriveUserKey(userId, userPassword);
  const layer1 = encryptAES256GCM(file, userKey);
  
  // Layer 2: Organization encryption (if org account)
  if (user.organizationId) {
    const orgKey = getOrganizationKey(user.organizationId);
    const layer2 = encryptAES256GCM(layer1, orgKey);
  } else {
    const layer2 = layer1;
  }
  
  // Layer 3: Infrastructure encryption (AWS S3 SSE or on-prem)
  // - AWS S3: SSE-KMS (AWS manages this)
  // - On-prem: LUKS full disk encryption
  
  return layer2;
};

// Why multiple layers?
// - Layer 1: Protects from everyone (zero-knowledge)
// - Layer 2: Org admin can recover if user leaves
// - Layer 3: Protects from physical theft of drives
```

### **1.3 Encryption in Transit (Network)**

```javascript
// TLS 1.3 Configuration (Latest, most secure)
const TLS_CONFIG = {
  minVersion: 'TLSv1.3',          // Only TLS 1.3
  maxVersion: 'TLSv1.3',
  
  // Cipher suites (only strongest)
  ciphers: [
    'TLS_AES_256_GCM_SHA384',     // AES-256-GCM (AEAD)
    'TLS_CHACHA20_POLY1305_SHA256' // ChaCha20-Poly1305 (mobile-optimized)
  ],
  
  // Perfect Forward Secrecy (PFS)
  honorCipherOrder: true,
  
  // HSTS (Force HTTPS)
  hsts: {
    maxAge: 31536000,             // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Certificate pinning
  certificatePinning: {
    enabled: true,
    pins: [
      'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',  // Primary cert
      'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB='   // Backup cert
    ]
  }
};

// Express.js implementation
import helmet from 'helmet';

app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  
  // Additional security headers
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // For Tailwind
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  
  // Prevent MIME sniffing
  noSniff: true,
  
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  
  // XSS protection
  xssFilter: true
}));
```

### **1.4 Encryption Key Management**

```javascript
// Key hierarchy (defense in depth)
const KEY_HIERARCHY = {
  // Level 1: Master Encryption Key (MEK)
  // - Stored in HSM or AWS KMS
  // - Never leaves secure environment
  // - Rotated annually
  masterKey: {
    type: 'AES-256',
    storage: 'AWS KMS',
    rotation: 'annual',
    access: 'admin-only'
  },
  
  // Level 2: Organization Keys
  // - Encrypted with MEK
  // - One per organization
  // - Rotated quarterly
  organizationKeys: {
    type: 'AES-256',
    derivation: 'HKDF',
    rotation: 'quarterly',
    access: 'org-admin'
  },
  
  // Level 3: User Keys
  // - Derived from password (PBKDF2)
  // - Never stored server-side
  // - Rotated on password change
  userKeys: {
    type: 'AES-256',
    derivation: 'PBKDF2',
    iterations: 100000,
    rotation: 'password-change',
    access: 'user-only'
  },
  
  // Level 4: File Keys
  // - Random per file
  // - Encrypted with user key
  // - Never reused
  fileKeys: {
    type: 'AES-256',
    generation: 'crypto.randomBytes(32)',
    storage: 'encrypted-with-user-key',
    rotation: 'never (unique per file)'
  }
};

// Key rotation strategy
const rotateKeys = async () => {
  // 1. Generate new master key
  const newMasterKey = await kms.generateDataKey();
  
  // 2. Re-encrypt all organization keys with new master key
  const orgKeys = await db.query('SELECT * FROM organization_keys');
  for (const orgKey of orgKeys) {
    const decrypted = decrypt(orgKey.encrypted, oldMasterKey);
    const reEncrypted = encrypt(decrypted, newMasterKey);
    await db.query(
      'UPDATE organization_keys SET encrypted = ? WHERE id = ?',
      [reEncrypted, orgKey.id]
    );
  }
  
  // 3. Update master key reference
  await db.query(
    'UPDATE key_metadata SET current_master_key_id = ?, rotated_at = NOW()',
    [newMasterKey.id]
  );
  
  // 4. Keep old master key for 90 days (decrypt old data)
  // 5. After 90 days, ensure all data re-encrypted, then delete old key
};
```

---

## ✅ Part 2: INTEGRITY

**Goal:** Ensure data hasn't been tampered with

### **2.1 Cryptographic Hashing**

```javascript
// Generate file hash (SHA-256)
const generateFileHash = (file) => {
  const hash = crypto.createHash('sha256');
  hash.update(file);
  return hash.digest('hex');
};

// Store hash in database (immutable)
const storeFileMetadata = async (file, userId) => {
  const fileId = crypto.randomUUID();
  const hash = generateFileHash(file);
  const timestamp = new Date();
  
  // PostgreSQL with immutability trigger
  await db.query(`
    INSERT INTO files (
      id,
      user_id,
      filename,
      file_hash,
      file_size,
      upload_timestamp,
      hash_algorithm
    ) VALUES (?, ?, ?, ?, ?, ?, 'SHA-256')
  `, [fileId, userId, file.name, hash, file.size, timestamp]);
  
  // Also store in audit log (separate table)
  await db.query(`
    INSERT INTO file_audit_log (
      file_id,
      action,
      hash_at_time,
      timestamp
    ) VALUES (?, 'UPLOAD', ?, NOW())
  `, [fileId, hash]);
  
  return { fileId, hash };
};

// Verify file integrity on download
const verifyFileIntegrity = async (fileId, downloadedFile) => {
  // 1. Get stored hash
  const { file_hash: storedHash } = await db.query(
    'SELECT file_hash FROM files WHERE id = ?',
    [fileId]
  );
  
  // 2. Calculate current hash
  const currentHash = generateFileHash(downloadedFile);
  
  // 3. Compare
  if (storedHash !== currentHash) {
    // TAMPERING DETECTED!
    await db.query(`
      INSERT INTO security_incidents (
        file_id,
        incident_type,
        details,
        detected_at
      ) VALUES (?, 'TAMPERING_DETECTED', ?, NOW())
    `, [fileId, `Expected: ${storedHash}, Got: ${currentHash}`]);
    
    throw new Error('File integrity check failed. File may have been tampered with.');
  }
  
  return true;
};
```

### **2.2 Digital Signatures (Non-Repudiation)**

```javascript
// Sign file with user's private key (prove authorship)
import { sign, verify } from 'crypto';

const signFile = (file, userPrivateKey) => {
  // 1. Hash the file
  const fileHash = generateFileHash(file);
  
  // 2. Sign the hash with private key
  const signature = sign('sha256', Buffer.from(fileHash), {
    key: userPrivateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING
  });
  
  return {
    file,
    signature: signature.toString('base64'),
    signedBy: userId,
    signedAt: new Date(),
    algorithm: 'RSA-PSS with SHA-256'
  };
};

// Verify signature (prove file came from user)
const verifySignature = (file, signature, userPublicKey) => {
  const fileHash = generateFileHash(file);
  
  const isValid = verify(
    'sha256',
    Buffer.from(fileHash),
    {
      key: userPublicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING
    },
    Buffer.from(signature, 'base64')
  );
  
  if (!isValid) {
    throw new Error('Digital signature verification failed. File may be forged.');
  }
  
  return { valid: true, signedBy: userId };
};

// Use case: Legal documents, contracts
// - Prove document came from specific person
// - Prove document hasn't been altered
// - Non-repudiation (signer can't deny signing)
```

### **2.3 Immutable Audit Logs**

```javascript
// Write-only audit log (can't be modified or deleted)
const logAuditEvent = async (event) => {
  const logId = crypto.randomUUID();
  const logHash = crypto.createHash('sha256')
    .update(JSON.stringify(event))
    .digest('hex');
  
  // Get previous log entry's hash (blockchain-style chaining)
  const previousLog = await db.query(`
    SELECT hash FROM audit_logs ORDER BY created_at DESC LIMIT 1
  `);
  
  const previousHash = previousLog?.hash || '0'.repeat(64);
  
  // Chain current log to previous (tamper-evident)
  const chainedHash = crypto.createHash('sha256')
    .update(previousHash + logHash)
    .digest('hex');
  
  // Insert log (can never be updated or deleted - PostgreSQL trigger enforces)
  await db.query(`
    INSERT INTO audit_logs (
      id,
      user_id,
      action,
      resource_type,
      resource_id,
      ip_address,
      user_agent,
      details,
      hash,
      previous_hash,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    logId,
    event.userId,
    event.action,
    event.resourceType,
    event.resourceId,
    event.ipAddress,
    event.userAgent,
    JSON.stringify(event.details),
    chainedHash,
    previousHash
  ]);
  
  return logId;
};

// Verify audit log integrity (detect tampering)
const verifyAuditLogIntegrity = async () => {
  const logs = await db.query(`
    SELECT * FROM audit_logs ORDER BY created_at ASC
  `);
  
  let previousHash = '0'.repeat(64);
  
  for (const log of logs) {
    // Recalculate hash
    const logData = {
      userId: log.user_id,
      action: log.action,
      resourceType: log.resource_type,
      resourceId: log.resource_id,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      details: log.details
    };
    
    const calculatedHash = crypto.createHash('sha256')
      .update(JSON.stringify(logData))
      .digest('hex');
    
    const calculatedChainedHash = crypto.createHash('sha256')
      .update(previousHash + calculatedHash)
      .digest('hex');
    
    if (calculatedChainedHash !== log.hash) {
      throw new Error(`Audit log tampering detected at log ID: ${log.id}`);
    }
    
    if (log.previous_hash !== previousHash) {
      throw new Error(`Audit log chain broken at log ID: ${log.id}`);
    }
    
    previousHash = log.hash;
  }
  
  return { valid: true, logsVerified: logs.length };
};

// PostgreSQL trigger to prevent modifications
/*
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Audit logs cannot be modified';
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Audit logs cannot be deleted';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();
*/
```

### **2.4 Version Control (Track Changes)**

```javascript
// Store every file version (never delete)
const saveFileVersion = async (fileId, newContent, userId) => {
  const versionId = crypto.randomUUID();
  const newHash = generateFileHash(newContent);
  
  // Get current version
  const currentVersion = await db.query(`
    SELECT version_number FROM file_versions 
    WHERE file_id = ? ORDER BY version_number DESC LIMIT 1
  `, [fileId]);
  
  const newVersionNumber = (currentVersion?.version_number || 0) + 1;
  
  // Save new version
  await db.query(`
    INSERT INTO file_versions (
      id,
      file_id,
      version_number,
      file_hash,
      storage_url,
      uploaded_by,
      upload_timestamp,
      file_size
    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
  `, [
    versionId,
    fileId,
    newVersionNumber,
    newHash,
    storageUrl,
    userId,
    newContent.size
  ]);
  
  // Update main file record
  await db.query(`
    UPDATE files 
    SET current_version = ?, file_hash = ?, modified_at = NOW()
    WHERE id = ?
  `, [newVersionNumber, newHash, fileId]);
  
  // Log the change
  await logAuditEvent({
    userId,
    action: 'FILE_VERSION_CREATED',
    resourceType: 'file',
    resourceId: fileId,
    details: { versionNumber: newVersionNumber, hash: newHash }
  });
  
  return { versionId, versionNumber: newVersionNumber };
};

// Retrieve specific version
const getFileVersion = async (fileId, versionNumber) => {
  const version = await db.query(`
    SELECT * FROM file_versions 
    WHERE file_id = ? AND version_number = ?
  `, [fileId, versionNumber]);
  
  if (!version) {
    throw new Error(`Version ${versionNumber} not found`);
  }
  
  // Download from storage
  const file = await downloadFromStorage(version.storage_url);
  
  // Verify integrity
  const currentHash = generateFileHash(file);
  if (currentHash !== version.file_hash) {
    throw new Error('Version integrity check failed');
  }
  
  return file;
};
```

---

## 🚀 Part 3: AVAILABILITY

**Goal:** Ensure system is accessible when needed

### **3.1 High Availability Architecture**

```
┌────────────────────────────────────────┐
│        Load Balancer (HAProxy)         │
│        Multiple availability zones     │
└──────────┬─────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐     ┌───▼───┐
│ App   │     │ App   │
│ Server│     │ Server│
│   1   │     │   2   │
└───┬───┘     └───┬───┘
    │             │
    └──────┬──────┘
           │
    ┌──────▼──────────────────────────┐
    │  Database (PostgreSQL)          │
    │  Primary + Replica (Streaming)  │
    │  Automatic failover             │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │  Storage (AWS S3)               │
    │  Multi-AZ replication           │
    │  99.999999999% durability       │
    └─────────────────────────────────┘
```

### **3.2 Redundancy Strategy**

```javascript
// Multi-region deployment
const REGIONS = {
  primary: 'us-east-1',
  secondary: 'eu-central-1',
  tertiary: 'ap-southeast-1'
};

// Active-passive failover
const healthCheck = async () => {
  try {
    // Check primary region
    const primaryHealth = await fetch(`https://${REGIONS.primary}.cryptguard.com/health`);
    
    if (primaryHealth.status === 200) {
      return REGIONS.primary;  // Primary healthy
    }
  } catch (error) {
    // Primary down, failover to secondary
    console.error('Primary region down, failing over to secondary');
    return REGIONS.secondary;
  }
};

// Data replication
const replicateData = async (fileId, content) => {
  // Upload to primary
  await s3.upload({
    Bucket: `cryptguard-${REGIONS.primary}`,
    Key: fileId,
    Body: content
  });
  
  // Asynchronously replicate to secondary
  await s3.replication.enable({
    source: `cryptguard-${REGIONS.primary}`,
    destination: `cryptguard-${REGIONS.secondary}`,
    rules: [{
      status: 'Enabled',
      priority: 1,
      filter: {},
      destination: {
        bucket: `arn:aws:s3:::cryptguard-${REGIONS.secondary}`
      }
    }]
  });
};
```

### **3.3 Backup & Recovery**

```javascript
// Automated backups (3-2-1 rule)
const BACKUP_SCHEDULE = {
  // Continuous backups (PostgreSQL WAL archiving)
  continuous: {
    enabled: true,
    walArchiving: true,
    retentionDays: 30
  },
  
  // Hourly snapshots (last 24 hours)
  hourly: {
    frequency: '0 * * * *',  // Every hour
    retention: 24
  },
  
  // Daily backups (last 7 days)
  daily: {
    frequency: '0 2 * * *',  // 2 AM daily
    retention: 7
  },
  
  // Weekly backups (last 4 weeks)
  weekly: {
    frequency: '0 2 * * 0',  // 2 AM Sunday
    retention: 4
  },
  
  // Monthly backups (last 12 months)
  monthly: {
    frequency: '0 2 1 * *',  // 2 AM 1st of month
    retention: 12
  },
  
  // Yearly backups (indefinite)
  yearly: {
    frequency: '0 2 1 1 *',  // 2 AM Jan 1st
    retention: 'indefinite'
  }
};

// Backup execution
const performBackup = async (type) => {
  const backupId = crypto.randomUUID();
  const timestamp = new Date();
  
  // 1. Database backup
  await execAsync(`pg_dump -h ${DB_HOST} -U ${DB_USER} ${DB_NAME} | gzip > /backups/${backupId}-db.sql.gz`);
  
  // 2. Files backup (S3 versioning + cross-region)
  await s3.copyBucket({
    source: 'cryptguard-production',
    destination: `cryptguard-backups/${timestamp.toISOString()}`
  });
  
  // 3. Encrypt backup
  const backupKey = crypto.randomBytes(32);
  const encryptedBackup = encryptAES256(backup, backupKey);
  
  // 4. Store backup key (encrypted with HSM key)
  await kms.encrypt({
    KeyId: process.env.BACKUP_KEY_ID,
    Plaintext: backupKey
  });
  
  // 5. Verify backup integrity
  const backupHash = generateFileHash(encryptedBackup);
  
  // 6. Log backup
  await db.query(`
    INSERT INTO backup_log (
      id,
      backup_type,
      backup_hash,
      created_at,
      size_bytes
    ) VALUES (?, ?, ?, NOW(), ?)
  `, [backupId, type, backupHash, encryptedBackup.length]);
  
  return { backupId, hash: backupHash };
};

// Disaster recovery
const restoreFromBackup = async (backupId) => {
  // 1. Retrieve backup
  const backup = await s3.getObject({
    Bucket: 'cryptguard-backups',
    Key: backupId
  });
  
  // 2. Retrieve and decrypt backup key
  const { backupKeyEncrypted } = await db.query(
    'SELECT backup_key_encrypted FROM backup_log WHERE id = ?',
    [backupId]
  );
  
  const backupKey = await kms.decrypt({
    CiphertextBlob: backupKeyEncrypted
  });
  
  // 3. Decrypt backup
  const decryptedBackup = decryptAES256(backup, backupKey);
  
  // 4. Verify integrity
  const { backup_hash } = await db.query(
    'SELECT backup_hash FROM backup_log WHERE id = ?',
    [backupId]
  );
  
  if (generateFileHash(decryptedBackup) !== backup_hash) {
    throw new Error('Backup integrity check failed');
  }
  
  // 5. Restore database
  await execAsync(`gunzip < /tmp/${backupId}-db.sql.gz | psql -h ${DB_HOST} -U ${DB_USER} ${DB_NAME}`);
  
  // 6. Restore files
  await s3.restoreBucket({
    source: backupId,
    destination: 'cryptguard-production'
  });
  
  return { success: true, restoredFrom: backupId };
};
```

### **3.4 DDoS Protection**

```javascript
// Rate limiting (multiple layers)
const RATE_LIMITS = {
  // Per IP address
  perIP: {
    login: { max: 5, window: '15m' },        // 5 login attempts per 15 min
    api: { max: 100, window: '1m' },         // 100 API calls per minute
    upload: { max: 10, window: '1h' },       // 10 uploads per hour
    download: { max: 50, window: '1h' }      // 50 downloads per hour
  },
  
  // Per user
  perUser: {
    api: { max: 1000, window: '1h' },        // 1000 API calls per hour
    upload: { max: 100, window: '1d' },      // 100 uploads per day
    storage: { max: 50 * 1024 * 1024 * 1024 } // 50GB total storage
  },
  
  // Global (entire system)
  global: {
    api: { max: 10000, window: '1m' },       // 10k requests per minute
    concurrent: { max: 1000 }                // Max 1000 concurrent connections
  }
};

// Implementation with Redis
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient
  }),
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  message: 'Too many login attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  
  // Skip for whitelisted IPs
  skip: (req) => {
    const whitelist = ['127.0.0.1', '10.0.0.0/8'];
    return whitelist.includes(req.ip);
  }
});

// Apply to routes
app.post('/api/auth/login', loginLimiter, loginController);
```

### **3.5 Monitoring & Alerting**

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    checks: {}
  };
  
  // Database check
  try {
    await db.query('SELECT 1');
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
  }
  
  // Storage check
  try {
    await s3.headBucket({ Bucket: 'cryptguard-production' });
    health.checks.storage = 'healthy';
  } catch (error) {
    health.checks.storage = 'unhealthy';
    health.status = 'degraded';
  }
  
  // Redis check
  try {
    await redisClient.ping();
    health.checks.redis = 'healthy';
  } catch (error) {
    health.checks.redis = 'unhealthy';
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Alerting (PagerDuty, Slack, email)
const sendAlert = async (severity, message) => {
  // Severity levels: critical, high, medium, low, info
  
  if (severity === 'critical') {
    // PagerDuty (wake up on-call engineer)
    await pagerduty.trigger({
      routing_key: process.env.PAGERDUTY_KEY,
      event_action: 'trigger',
      payload: {
        summary: message,
        severity: 'critical',
        source: 'CryptGuard Production'
      }
    });
  }
  
  if (severity === 'high' || severity === 'critical') {
    // Slack
    await slack.post({
      channel: '#alerts',
      text: `🚨 ${severity.toUpperCase()}: ${message}`
    });
  }
  
  // Always log
  logger.error(message, { severity });
};

// Metrics collection (Prometheus)
import promClient from 'prom-client';

const register = new promClient.Registry();

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users'
});

const filesUploaded = new promClient.Counter({
  name: 'files_uploaded_total',
  help: 'Total number of files uploaded'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(activeUsers);
register.registerMetric(filesUploaded);

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

**[CONTINUED IN NEXT MESSAGE - Part 2: Compliance Frameworks]**

Last Updated: November 10, 2025
