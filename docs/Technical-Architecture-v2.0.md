# CryptGuard v2.0 - Technical Architecture Document

**Version:** 2.0.0  
**Date:** November 7, 2025  
**Status:** Planning Phase  
**Architecture Type:** Cloud-Native, Microservices-Ready

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [System Components](#system-components)
5. [Database Design](#database-design)
6. [API Design](#api-design)
7. [Security Architecture](#security-architecture)
8. [File Processing Pipeline](#file-processing-pipeline)
9. [Deployment Architecture](#deployment-architecture)
10. [Scalability & Performance](#scalability--performance)
11. [Monitoring & Logging](#monitoring--logging)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Web App      │  │ Mobile PWA   │  │ Desktop App  │         │
│  │ (React)      │  │ (React PWA)  │  │ (Future)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS/WSS │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Load Balancer (AWS ALB / Nginx)                         │  │
│  │  - Rate Limiting                                         │  │
│  │  - SSL Termination                                       │  │
│  │  - Request Routing                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer (Node.js)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Auth      │  │   File      │  │  Organization│            │
│  │  Service    │  │  Service    │  │   Service    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Sharing    │  │  Compliance │  │   Audit      │            │
│  │  Service    │  │  Service    │  │   Service    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Database Layer         │  │   Storage Layer          │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │ PostgreSQL         │  │  │  │ AWS S3 / MinIO     │  │
│  │ (Primary DB)       │  │  │  │ (File Storage)     │  │
│  └────────────────────┘  │  │  └────────────────────┘  │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │ Redis              │  │  │  │ CloudFlare R2      │  │
│  │ (Cache/Sessions)   │  │  │  │ (CDN/Backup)       │  │
│  └────────────────────┘  │  │  └────────────────────┘  │
└──────────────────────────┘  └──────────────────────────┘
```

### 1.2 Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend** | React + Vite | Fast, modern, existing codebase |
| **Backend** | Node.js + Express | JavaScript consistency, existing team knowledge |
| **Database** | PostgreSQL | ACID compliance, better for relational data than MongoDB |
| **Cache** | Redis | Session management, rate limiting, real-time features |
| **File Storage** | AWS S3 / MinIO | Industry standard, scalable, cost-effective |
| **Authentication** | JWT + Refresh Tokens | Stateless, scalable, mobile-friendly |
| **Encryption** | AES-256-GCM (client-side) | Zero-knowledge encryption |
| **API Style** | REST + WebSockets | REST for CRUD, WS for real-time updates |

---

## 2. Technology Stack

### 2.1 Frontend Stack

```yaml
Core:
  - React 18.x
  - Vite 5.x (build tool)
  - React Router v6 (routing)
  
UI/Styling:
  - TailwindCSS 3.x
  - DaisyUI (component library)
  - Framer Motion (animations)
  - Radix UI (accessible primitives)
  
State Management:
  - React Context API (auth, theme)
  - TanStack Query (server state)
  - Zustand (global state - future)
  
Encryption:
  - Web Crypto API (native browser)
  - crypto-js (fallback)
  
File Handling:
  - axios (HTTP client)
  - file-saver (downloads)
  - react-dropzone (file uploads)
  
Forms & Validation:
  - React Hook Form
  - Zod (schema validation)
  
PWA:
  - Vite PWA Plugin
  - Workbox (service workers)
```

### 2.2 Backend Stack

```yaml
Core:
  - Node.js 20.x LTS
  - Express.js 4.x
  - TypeScript (future migration)
  
Authentication:
  - jsonwebtoken (JWT)
  - bcrypt (password hashing)
  - speakeasy (2FA TOTP)
  - nodemailer (email verification)
  
Database:
  - pg (PostgreSQL driver)
  - Prisma ORM (type-safe queries)
  - Redis (ioredis client)
  
File Processing:
  - multer (file uploads)
  - AWS SDK v3 (S3 operations)
  - sharp (image optimization)
  - crypto (encryption/hashing)
  
Security:
  - helmet (security headers)
  - cors (cross-origin)
  - express-rate-limit (rate limiting)
  - express-validator (input validation)
  
Logging & Monitoring:
  - winston (logging)
  - morgan (HTTP logging)
  - pino (performance logging)
  
Testing:
  - Jest (unit tests)
  - Supertest (API tests)
  - Playwright (E2E tests)
```

### 2.3 Infrastructure & DevOps

```yaml
Cloud Provider:
  - AWS (Primary)
  - Vercel (Frontend hosting)
  - Render.com (Backend - initial)
  
CI/CD:
  - GitHub Actions (automation)
  - Docker (containerization)
  - Kubernetes (future orchestration)
  
Monitoring:
  - AWS CloudWatch (metrics)
  - Sentry (error tracking)
  - Grafana + Prometheus (dashboards)
  
CDN & DNS:
  - CloudFlare (CDN, DDoS protection)
  - Route53 (DNS management)
```

---

## 3. Architecture Patterns

### 3.1 Design Patterns Used

**1. Repository Pattern**
```javascript
// Abstraction layer for data access
class FileRepository {
  async create(fileData) { /* ... */ }
  async findById(id) { /* ... */ }
  async update(id, data) { /* ... */ }
}
```

**2. Service Layer Pattern**
```javascript
// Business logic separation
class FileService {
  constructor(fileRepo, storageService, auditService) {
    this.fileRepo = fileRepo;
    this.storageService = storageService;
    this.auditService = auditService;
  }
  
  async uploadFile(file, userId) {
    // Orchestrate multiple repositories
  }
}
```

**3. Middleware Pipeline**
```javascript
// Request processing pipeline
app.post('/api/files',
  authenticate,
  authorize(['upload']),
  validateFileUpload,
  uploadToS3,
  handleUpload
);
```

**4. Factory Pattern**
```javascript
// Create different encryption strategies
class EncryptionFactory {
  static create(type) {
    switch(type) {
      case 'AES-256': return new AES256Strategy();
      case 'ChaCha20': return new ChaCha20Strategy();
    }
  }
}
```

### 3.2 Architectural Principles

- ✅ **Separation of Concerns**: Controllers → Services → Repositories
- ✅ **Dependency Injection**: Services receive dependencies via constructor
- ✅ **Single Responsibility**: Each module does one thing well
- ✅ **Open/Closed**: Extend via plugins, don't modify core
- ✅ **DRY (Don't Repeat Yourself)**: Shared utilities and middleware
- ✅ **SOLID Principles**: Throughout codebase

---

## 4. System Components

### 4.1 Authentication Service

**Responsibilities:**
- User registration/login
- JWT token generation/validation
- Refresh token rotation
- Password reset flows
- 2FA (TOTP) management
- Session management

**Key Endpoints:**
```javascript
POST   /api/auth/register          // Create account
POST   /api/auth/login             // Email + password login
POST   /api/auth/refresh           // Refresh JWT token
POST   /api/auth/logout            // Invalidate tokens
POST   /api/auth/forgot-password   // Request reset
POST   /api/auth/reset-password    // Complete reset
POST   /api/auth/2fa/enable        // Setup 2FA
POST   /api/auth/2fa/verify        // Verify 2FA code
GET    /api/auth/me                // Get current user
```

**Security Features:**
- Argon2 password hashing (more secure than bcrypt)
- Rate limiting (5 attempts per 15 min)
- Account lockout after failed attempts
- Email verification required
- Device fingerprinting
- Suspicious login detection

### 4.2 File Service

**Responsibilities:**
- File upload/download
- Encryption key management
- File versioning
- Hash calculation & verification
- File categorization
- Search & filtering

**Key Endpoints:**
```javascript
POST   /api/files/upload           // Upload encrypted file
GET    /api/files/:id              // Download file
GET    /api/files/:id/info         // Get file metadata
PUT    /api/files/:id              // Update file metadata
DELETE /api/files/:id              // Delete file
POST   /api/files/:id/verify       // Verify file integrity
GET    /api/files                  // List user files
GET    /api/files/search           // Search files
POST   /api/files/:id/version      // Create new version
GET    /api/files/:id/versions     // List versions
```

**File Processing Pipeline:**
```
1. Client encrypts file (AES-256-GCM)
2. Upload to S3 with multipart for large files
3. Calculate SHA-256 hash
4. Store metadata in PostgreSQL
5. Create audit log entry
6. Return file ID & access URL
```

### 4.3 Organization Service

**Responsibilities:**
- Organization CRUD operations
- Team/department management
- Member invitations
- Role assignments
- Organization-wide settings
- Billing & subscription management

**Key Endpoints:**
```javascript
POST   /api/organizations          // Create organization
GET    /api/organizations/:id      // Get org details
PUT    /api/organizations/:id      // Update org
DELETE /api/organizations/:id      // Delete org
POST   /api/organizations/:id/members    // Invite member
DELETE /api/organizations/:id/members/:userId  // Remove member
PUT    /api/organizations/:id/members/:userId/role  // Change role
GET    /api/organizations/:id/teams      // List teams
POST   /api/organizations/:id/teams      // Create team
```

**Organization Structure:**
```
Organization
├── Owner (1)
├── Admins (many)
├── Departments
│   ├── Legal
│   ├── Finance
│   └── HR
├── Teams
│   ├── Team A (members, shared vaults)
│   └── Team B
└── Shared Vaults
    ├── Company-wide
    └── Department-specific
```

### 4.4 Sharing Service

**Responsibilities:**
- Share files with users/teams
- Generate shareable links
- Set permissions & expiry
- Revoke access
- Track share analytics

**Key Endpoints:**
```javascript
POST   /api/shares                 // Share file
GET    /api/shares/:shareId        // Access shared file
DELETE /api/shares/:shareId        // Revoke share
PUT    /api/shares/:shareId        // Update share settings
GET    /api/files/:id/shares       // List file shares
POST   /api/shares/link            // Generate public link
```

**Share Types:**
```javascript
const shareTypes = {
  DIRECT: 'user_to_user',        // Share with specific user
  TEAM: 'user_to_team',          // Share with team
  LINK: 'public_link',           // Anyone with link
  LINK_PASSWORD: 'password_link' // Link + password
};

const permissions = {
  VIEW: 'view',                  // View only
  DOWNLOAD: 'download',          // View + download
  EDIT: 'edit',                  // View + download + upload new version
  MANAGE: 'manage'               // Full control
};
```

### 4.5 Compliance Service

**Responsibilities:**
- Retention policies
- Legal holds
- Compliance reports
- Data classification
- Privacy controls (GDPR)

**Key Endpoints:**
```javascript
POST   /api/compliance/policies         // Create retention policy
GET    /api/compliance/policies         // List policies
POST   /api/compliance/legal-holds      // Place legal hold
GET    /api/compliance/reports          // Generate report
POST   /api/compliance/data-export      // GDPR data export
POST   /api/compliance/data-deletion    // GDPR right to be forgotten
```

### 4.6 Audit Service

**Responsibilities:**
- Log all file operations
- Track user activities
- Generate audit trails
- Compliance reporting
- Security event monitoring

**Logged Events:**
```javascript
const auditEvents = {
  // Authentication
  'auth.login',
  'auth.logout',
  'auth.failed_login',
  'auth.password_reset',
  
  // File Operations
  'file.upload',
  'file.download',
  'file.view',
  'file.delete',
  'file.share',
  'file.modify',
  
  // Organization
  'org.member_added',
  'org.member_removed',
  'org.role_changed',
  
  // Security
  'security.2fa_enabled',
  'security.suspicious_activity',
  'security.api_key_created'
};
```

---

## 5. Database Design

### 5.1 PostgreSQL Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  master_key_encrypted TEXT NOT NULL,  -- User's master encryption key (encrypted with password)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  account_status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(account_status);

-- Organizations Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  industry_type VARCHAR(50), -- law_firm, healthcare, forensics, etc.
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, enterprise
  max_storage_gb INTEGER DEFAULT 10,
  max_users INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organization Members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- owner, admin, member, guest
  department VARCHAR(100),
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- Files Table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- File Info
  original_filename VARCHAR(255) NOT NULL,
  encrypted_filename VARCHAR(255) NOT NULL, -- Random name in S3
  file_size BIGINT NOT NULL, -- In bytes
  mime_type VARCHAR(100),
  
  -- Storage
  storage_provider VARCHAR(20) DEFAULT 's3', -- s3, minio, cloudflare_r2
  storage_path TEXT NOT NULL,
  storage_region VARCHAR(50),
  
  -- Encryption
  encryption_algorithm VARCHAR(20) DEFAULT 'AES-256-GCM',
  encrypted_key TEXT NOT NULL, -- File's encryption key (encrypted with user's master key)
  initialization_vector TEXT NOT NULL,
  
  -- Integrity
  file_hash_sha256 VARCHAR(64) NOT NULL,
  file_hash_algorithm VARCHAR(20) DEFAULT 'SHA-256',
  
  -- Metadata
  category VARCHAR(50), -- document, image, video, archive, etc.
  tags TEXT[], -- Array of tags
  description TEXT,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_file_id UUID REFERENCES files(id), -- For versioning
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, deleted, archived
  deleted_at TIMESTAMP,
  
  -- Compliance
  retention_policy_id UUID,
  legal_hold BOOLEAN DEFAULT FALSE,
  legal_hold_reason TEXT,
  auto_delete_at TIMESTAMP
);

CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_org ON files(organization_id);
CREATE INDEX idx_files_hash ON files(file_hash_sha256);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_category ON files(category);

-- File Shares
CREATE TABLE file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES users(id),
  
  -- Share Type
  share_type VARCHAR(20) NOT NULL, -- direct, team, link, password_link
  
  -- Recipients
  shared_with_user_id UUID REFERENCES users(id),
  shared_with_team_id UUID,
  public_link_token VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255), -- For password-protected links
  
  -- Permissions
  permission VARCHAR(20) DEFAULT 'view', -- view, download, edit, manage
  
  -- Restrictions
  expires_at TIMESTAMP,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  max_downloads INTEGER,
  current_downloads INTEGER DEFAULT 0,
  
  -- Watermark
  apply_watermark BOOLEAN DEFAULT FALSE,
  watermark_text TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP,
  revoked_at TIMESTAMP,
  
  CONSTRAINT valid_share_type CHECK (
    (share_type = 'direct' AND shared_with_user_id IS NOT NULL) OR
    (share_type = 'team' AND shared_with_team_id IS NOT NULL) OR
    (share_type IN ('link', 'password_link') AND public_link_token IS NOT NULL)
  )
);

CREATE INDEX idx_shares_file ON file_shares(file_id);
CREATE INDEX idx_shares_user ON file_shares(shared_with_user_id);
CREATE INDEX idx_shares_token ON file_shares(public_link_token);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who & Where
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  ip_address INET,
  user_agent TEXT,
  
  -- What
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(20) NOT NULL, -- auth, file, organization, security
  resource_type VARCHAR(50), -- file, user, organization
  resource_id UUID,
  
  -- Details
  event_data JSONB, -- Additional structured data
  status VARCHAR(20), -- success, failure
  error_message TEXT,
  
  -- When
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_type ON audit_logs(event_type);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- Compliance Policies
CREATE TABLE retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Rules
  retention_days INTEGER, -- NULL = infinite
  auto_delete BOOLEAN DEFAULT FALSE,
  applies_to_categories TEXT[], -- Which file categories
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions (Could also use Redis)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token_hash);
```

### 5.2 Redis Schema

```javascript
// Session Management
"session:{sessionId}" = {
  userId: "uuid",
  deviceInfo: {},
  expiresAt: timestamp
}

// Rate Limiting
"rate_limit:{ip}:{endpoint}" = counter (TTL: 15 minutes)
"rate_limit:{userId}:{endpoint}" = counter (TTL: 15 minutes)

// Cache
"user:{userId}" = userData (TTL: 1 hour)
"file:{fileId}:metadata" = fileMetadata (TTL: 30 minutes)
"organization:{orgId}" = orgData (TTL: 1 hour)

// Real-time Features
"active_users" = Set of user IDs
"file_upload_progress:{uploadId}" = {progress: 45}
```

---

## 6. API Design

### 6.1 RESTful API Conventions

**Base URL:** `https://api.cryptguard.com/v1`

**Request/Response Format:**
```javascript
// Request Headers
{
  "Authorization": "Bearer {jwt_token}",
  "Content-Type": "application/json",
  "X-Device-ID": "unique_device_identifier",
  "X-Client-Version": "2.0.0"
}

// Success Response (200)
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2025-11-07T10:30:00Z"
}

// Error Response (4xx/5xx)
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "The requested file does not exist",
    "details": { /* additional info */ }
  },
  "timestamp": "2025-11-07T10:30:00Z"
}

// Paginated Response
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 6.2 API Endpoints Reference

**Complete API documentation will be in Swagger/OpenAPI format.**

Key endpoint patterns:
- `GET /api/resource` - List resources
- `POST /api/resource` - Create resource
- `GET /api/resource/:id` - Get single resource
- `PUT /api/resource/:id` - Update resource
- `PATCH /api/resource/:id` - Partial update
- `DELETE /api/resource/:id` - Delete resource

### 6.3 WebSocket Events

```javascript
// Real-time notifications
"file:uploaded" - File upload complete
"file:shared" - File shared with you
"file:deleted" - File deleted
"organization:member_added" - New member joined
"share:accessed" - Someone accessed your shared file
"compliance:policy_triggered" - Retention policy activated
```

---

## 7. Security Architecture

### 7.1 Zero-Knowledge Encryption Flow

```
User Registration:
1. User enters password
2. Client generates master key (random 256-bit)
3. Master key encrypted with password (PBKDF2)
4. Encrypted master key sent to server
5. Server stores encrypted master key (can't decrypt it)

File Upload:
1. Client generates random file key (256-bit)
2. File encrypted with file key (AES-256-GCM)
3. File key encrypted with master key
4. Encrypted file → S3
5. Encrypted file key → PostgreSQL
6. Server never sees plaintext file or keys

File Download:
1. Client requests file
2. Server returns encrypted file + encrypted file key
3. Client decrypts file key with master key
4. Client decrypts file with file key
5. User sees plaintext file
```

### 7.2 Security Layers

```
Layer 1: Transport Security
├── HTTPS/TLS 1.3
├── Certificate pinning (mobile apps)
└── HSTS headers

Layer 2: Authentication
├── JWT tokens (15-min access, 7-day refresh)
├── 2FA (TOTP)
├── Device fingerprinting
└── Biometric support (future)

Layer 3: Authorization
├── RBAC (Role-Based Access Control)
├── Resource-level permissions
└── Attribute-based rules

Layer 4: Data Protection
├── Client-side encryption (zero-knowledge)
├── Encrypted at rest (S3 encryption)
├── Encrypted in transit (TLS)
└── Key rotation policies

Layer 5: Application Security
├── Input validation (Zod schemas)
├── SQL injection prevention (Prisma ORM)
├── XSS prevention (Content Security Policy)
├── CSRF protection (tokens)
└── Rate limiting

Layer 6: Monitoring & Response
├── Intrusion detection
├── Anomaly detection
├── Automated incident response
└── Security audit logs
```

### 7.3 Threat Model & Mitigations

| Threat | Mitigation |
|--------|------------|
| **Data breach** | Zero-knowledge encryption - stolen data is useless |
| **Man-in-the-middle** | TLS 1.3, certificate pinning |
| **Brute force attacks** | Rate limiting, account lockout, CAPTCHA |
| **Session hijacking** | HttpOnly cookies, device fingerprinting, IP validation |
| **XSS attacks** | CSP headers, input sanitization, React's auto-escaping |
| **SQL injection** | Prisma ORM with parameterized queries |
| **Password cracking** | Argon2 hashing (memory-hard) |
| **Insider threat** | Zero-knowledge = admins can't read files |
| **DDoS attacks** | CloudFlare protection, rate limiting |
| **Phishing** | 2FA required, email verification |

---

## 8. File Processing Pipeline

### 8.1 Upload Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Select file
       ▼
┌─────────────┐
│   Encrypt   │ AES-256-GCM with random key
└──────┬──────┘
       │ 2. Encrypted blob
       ▼
┌─────────────┐
│  Calculate  │ SHA-256 hash
│    Hash     │
└──────┬──────┘
       │ 3. Hash + encrypted file
       ▼
┌─────────────┐
│  Multipart  │ Split into chunks (5MB each)
│   Upload    │
└──────┬──────┘
       │ 4. Upload chunks to S3
       ▼
┌─────────────┐
│  S3 Bucket  │ Store encrypted file
└──────┬──────┘
       │ 5. S3 URL
       ▼
┌─────────────┐
│  API Call   │ POST /api/files
│             │ {hash, encryptedKey, s3Path}
└──────┬──────┘
       │ 6. Save metadata
       ▼
┌─────────────┐
│ PostgreSQL  │ Store file record + audit log
└──────┬──────┘
       │ 7. File ID
       ▼
┌─────────────┐
│  Response   │ {fileId, success: true}
└─────────────┘
```

### 8.2 Download & Verify Flow

```
┌─────────────┐
│  API Call   │ GET /api/files/:id
└──────┬──────┘
       │ 1. Check permissions
       ▼
┌─────────────┐
│ PostgreSQL  │ Get file metadata + encryptedKey
└──────┬──────┘
       │ 2. Metadata + S3 path
       ▼
┌─────────────┐
│     S3      │ Generate presigned URL (5 min)
└──────┬──────┘
       │ 3. Presigned URL
       ▼
┌─────────────┐
│  Browser    │ Download encrypted file
└──────┬──────┘
       │ 4. Decrypt file key with master key
       ▼
┌─────────────┐
│   Decrypt   │ Decrypt file with file key
└──────┬──────┘
       │ 5. Calculate hash of decrypted file
       ▼
┌─────────────┐
│   Verify    │ Compare hash with stored hash
└──────┬──────┘
       │ 6. Show file OR show "TAMPERED" warning
       ▼
┌─────────────┐
│  Audit Log  │ Log download event
└─────────────┘
```

### 8.3 Large File Handling

```javascript
// Multipart upload for files > 100MB
const uploadLargeFile = async (file) => {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  // 1. Initiate multipart upload
  const { uploadId } = await initiateMultipartUpload(file.name);
  
  // 2. Upload chunks in parallel (max 4 concurrent)
  const uploadPromises = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    uploadPromises.push(
      uploadChunk(uploadId, i + 1, chunk)
    );
    
    // Limit concurrent uploads
    if (uploadPromises.length >= 4) {
      await Promise.race(uploadPromises);
    }
  }
  
  await Promise.all(uploadPromises);
  
  // 3. Complete multipart upload
  await completeMultipartUpload(uploadId);
};
```

---

## 9. Deployment Architecture

### 9.1 Production Environment (AWS)

```
┌─────────────────────────────────────────────────────────────┐
│                     CloudFlare (CDN + WAF)                   │
│  - DDoS Protection                                          │
│  - SSL/TLS Termination                                      │
│  - Static Asset Caching                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        AWS Route53 (DNS)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│   Vercel (Frontend)       │  │  AWS ECS/Fargate (API)    │
│  - React SPA              │  │  - Docker Containers      │
│  - Global CDN             │  │  - Auto-scaling (2-10)    │
│  - Preview Deployments    │  │  - Application Load Bal.  │
└───────────────────────────┘  └───────────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
        ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
        │  AWS RDS          │  │  AWS ElastiCache  │  │  AWS S3           │
        │  (PostgreSQL)     │  │  (Redis)          │  │  (File Storage)   │
        │  - Multi-AZ       │  │  - Cluster mode   │  │  - Versioning     │
        │  - Auto backup    │  │  - 6 nodes        │  │  - Encryption     │
        │  - Read replicas  │  │                   │  │  - Lifecycle      │
        └───────────────────┘  └───────────────────┘  └───────────────────┘
```

### 9.2 Development & Staging Environments

```yaml
Development (Local):
  Frontend: localhost:5173 (Vite dev server)
  Backend: localhost:3000 (Express + nodemon)
  Database: PostgreSQL (Docker)
  Redis: Redis (Docker)
  S3: MinIO (local S3 compatible)

Staging:
  Frontend: staging.cryptguard.com (Vercel preview)
  Backend: staging-api.cryptguard.com (Render.com)
  Database: PostgreSQL (AWS RDS - small instance)
  Redis: Redis (AWS ElastiCache - single node)
  S3: AWS S3 (separate staging bucket)

Production:
  Frontend: app.cryptguard.com (Vercel)
  Backend: api.cryptguard.com (AWS ECS Fargate)
  Database: PostgreSQL (AWS RDS - Multi-AZ)
  Redis: Redis (AWS ElastiCache - cluster)
  S3: AWS S3 (production bucket)
```

### 9.3 CI/CD Pipeline

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Run unit tests
      - Run integration tests
      - Run security scans (Snyk, SonarQube)
      - Check code coverage (>80%)
  
  build-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - Build React app
      - Run Lighthouse CI
      - Deploy to Vercel (automatic)
  
  build-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - Build Docker image
      - Push to AWS ECR
      - Run database migrations
      - Deploy to ECS Fargate (rolling update)
      - Run smoke tests
  
  notify:
    needs: [build-frontend, build-backend]
    runs-on: ubuntu-latest
    steps:
      - Send Slack notification
      - Update status page
```

---

## 10. Scalability & Performance

### 10.1 Horizontal Scaling Strategy

```
Current Capacity (MVP):
- 1,000 concurrent users
- 10,000 files
- 1TB total storage

Scale to 10,000 users:
├── Frontend: Handled by Vercel CDN (infinite scale)
├── Backend: Scale from 2 → 10 ECS tasks
├── Database: Add read replicas (1 → 3)
├── Redis: Single node → Cluster mode
└── S3: No scaling needed (AWS handles it)

Scale to 100,000 users:
├── Backend: 10 → 50 ECS tasks
├── Database: Partition by organization_id (sharding)
├── Redis: Cluster with 6 nodes
├── Add caching layer (CDN for metadata)
└── Microservices split (file service separate)
```

### 10.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time** | <200ms (p95) | CloudWatch |
| **File Upload (10MB)** | <5 seconds | Client-side tracking |
| **File Download (10MB)** | <3 seconds | S3 CloudFront CDN |
| **Page Load Time** | <2 seconds | Lighthouse |
| **Time to Interactive** | <3 seconds | Core Web Vitals |
| **Database Queries** | <50ms (p95) | PostgreSQL logs |
| **Cache Hit Rate** | >80% | Redis metrics |
| **Uptime** | 99.9% | Status page |

### 10.3 Optimization Techniques

**Frontend:**
- Code splitting (lazy loading routes)
- Image optimization (WebP, lazy loading)
- Bundle size optimization (<300KB initial)
- Service worker caching (PWA)
- Virtual scrolling for large lists

**Backend:**
- Connection pooling (PostgreSQL)
- Query optimization (indexes, explain analyze)
- Redis caching (hot data)
- API response compression (gzip)
- Database query result caching

**Storage:**
- S3 Transfer Acceleration
- CloudFront CDN for downloads
- Multipart upload for large files
- S3 Intelligent-Tiering (cost optimization)

---

## 11. Monitoring & Logging

### 11.1 Monitoring Stack

```yaml
Application Performance:
  - AWS CloudWatch (metrics, logs, dashboards)
  - Sentry (error tracking, performance monitoring)
  - New Relic / Datadog (APM - future)

Infrastructure:
  - AWS CloudWatch (CPU, memory, network)
  - AWS X-Ray (distributed tracing)
  - Grafana + Prometheus (custom dashboards)

User Analytics:
  - PostHog (self-hosted analytics)
  - Google Analytics (traffic)
  - Hotjar (user behavior - future)

Security:
  - AWS GuardDuty (threat detection)
  - AWS CloudTrail (API audit logs)
  - Snyk (dependency vulnerabilities)
  - OWASP ZAP (security testing)
```

### 11.2 Key Metrics to Track

```javascript
// Business Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Files uploaded per day
- Storage used per organization
- Conversion rate (free → paid)
- Churn rate

// Technical Metrics
- API error rate
- API response time (p50, p95, p99)
- Database query performance
- Cache hit rate
- File upload success rate
- File download speed
- Uptime percentage

// Security Metrics
- Failed login attempts
- Suspicious activities detected
- 2FA adoption rate
- Password resets per day
- Unusual access patterns
```

### 11.3 Alerting Rules

```yaml
Critical (PagerDuty):
  - API error rate > 5%
  - Database connection failure
  - S3 upload failure rate > 10%
  - API response time > 2 seconds (p95)
  - Uptime < 99.5%

Warning (Slack):
  - API error rate > 2%
  - Database CPU > 80%
  - Redis memory > 90%
  - S3 upload failure rate > 5%
  - Unusual traffic spike (>200% normal)

Info (Email):
  - Daily metrics report
  - Security scan results
  - Cost optimization recommendations
```

---

## 12. Migration Plan (v1 Blockchain → v2 Cloud)

### 12.1 Code Migration Strategy

**Reusable Components (Copy from v1):**
```
✅ Frontend UI Components (90% reusable)
   ├── Button, Card, Modal, etc.
   ├── LoadingSpinner, SessionTimer
   └── File upload UI

✅ Encryption Utilities (100% reusable)
   ├── cryptoUtils.js (AES encryption)
   ├── Hash calculation
   └── Key derivation

✅ Authentication UI (80% reusable)
   ├── Login/Register forms
   ├── Session management
   └── Adapt wallet → email/password

⚠️ File Upload Logic (50% reusable)
   ├── Keep: File validation, encryption
   └── Replace: IPFS → S3, blockchain → API

❌ Blockchain Integration (0% reusable)
   ├── Remove: ethers.js, MetaMask
   ├── Remove: Smart contract calls
   └── Replace: Direct API calls
```

### 12.2 Data Migration (If Needed)

```javascript
// If users want to migrate files from v1 to v2
const migrateFile = async (ipfsCID) => {
  // 1. Download from IPFS
  const encryptedFile = await ipfs.get(ipfsCID);
  
  // 2. Upload to S3 (same encrypted format)
  const s3Path = await uploadToS3(encryptedFile);
  
  // 3. Get metadata from blockchain
  const metadata = await contract.getFileMetadata(ipfsCID);
  
  // 4. Store in PostgreSQL
  await db.files.create({
    ...metadata,
    storagePath: s3Path,
    storageProvider: 's3'
  });
  
  // 5. User keeps same encryption key (seamless)
};
```

---

## 13. Testing Strategy

### 13.1 Test Pyramid

```
                    ┌─────────────┐
                    │   E2E (5%)  │
                    │  Playwright │
                    └─────────────┘
                ┌─────────────────────┐
                │  Integration (15%)  │
                │  API Tests (Super.) │
                └─────────────────────┘
            ┌───────────────────────────────┐
            │      Unit Tests (80%)         │
            │  Jest (Backend + Frontend)    │
            └───────────────────────────────┘
```

### 13.2 Test Coverage Requirements

```yaml
Minimum Coverage:
  - Unit Tests: 80%
  - Integration Tests: 60%
  - E2E Tests: Critical flows only

Critical Flows to Test:
  1. User registration & login
  2. File upload & encryption
  3. File download & decryption
  4. File sharing with permissions
  5. Hash verification (tamper detection)
  6. Organization management
  7. Payment & subscription
```

---

## 14. Cost Estimation

### 14.1 MVP Costs (1,000 users, 10TB storage)

```yaml
AWS Costs:
  - ECS Fargate (2 tasks, 1GB each): $50/month
  - RDS PostgreSQL (db.t3.small): $50/month
  - ElastiCache Redis (cache.t3.micro): $20/month
  - S3 Storage (10TB): $250/month
  - S3 Data Transfer (5TB out): $450/month
  - CloudFront CDN: $100/month
  - Route53: $5/month
  Total AWS: ~$925/month

Services:
  - Vercel (Pro): $20/month
  - GitHub: Free
  - Sentry: $26/month
  - Domain + SSL: $15/month
  - Email (SendGrid): $20/month
  Total Services: ~$81/month

Grand Total: ~$1,000/month for MVP

Revenue to Break Even:
  - 50 users @ $20/month = $1,000/month
```

---

## 15. Future Architecture Considerations

### 15.1 Microservices Migration (v3.0+)

```
When to split into microservices:
├── When: 50,000+ users OR 10+ developers
├── Services to extract:
│   ├── Auth Service (handles all authentication)
│   ├── File Service (upload/download/storage)
│   ├── Sharing Service (permissions, links)
│   ├── Compliance Service (retention, legal holds)
│   └── Notification Service (emails, webhooks)
└── Benefits:
    ├── Independent scaling
    ├── Technology diversity (Go for file service?)
    ├── Team autonomy
    └── Fault isolation
```

### 15.2 Global Expansion

```
Multi-region deployment:
├── US-East (Primary)
├── EU-West (GDPR compliance)
├── Asia-Pacific (latency reduction)
└── Data residency compliance
```

---

## 16. Conclusion

This architecture is designed to:
✅ Scale from 1,000 to 100,000+ users
✅ Maintain zero-knowledge encryption
✅ Support industry-specific features
✅ Ensure 99.9% uptime
✅ Stay within reasonable costs
✅ Allow future microservices migration

**Next Steps:**
1. Review and approve architecture
2. Set up development environment
3. Begin Sprint 1 development
4. Iterate based on user feedback

---

**Document Version:** 2.0.0  
**Last Updated:** November 7, 2025  
**Maintained By:** CryptGuard Engineering Team
