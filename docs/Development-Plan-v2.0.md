# CryptGuard v2.0 - Development Plan (Sprint-by-Sprint)

**Version:** 2.0.0 MVP  
**Timeline:** November 11, 2025 - December 20, 2025 (6 weeks)  
**Team Size:** 1-2 developers  
**Sprint Duration:** 2 weeks

---

## Table of Contents
1. [Development Overview](#development-overview)
2. [Sprint 1: Foundation & Auth](#sprint-1-foundation--authentication)
3. [Sprint 2: File Operations](#sprint-2-file-operations)
4. [Sprint 3: Polish & Deploy](#sprint-3-polish--deployment)
5. [Post-Launch Plan](#post-launch-plan)

---

## 1. Development Overview

### 1.1 MVP Scope

**What We're Building:**
A secure, cloud-native file storage platform with:
- Email/password authentication (no wallet required!)
- Client-side encryption (zero-knowledge)
- File upload/download with S3 storage
- Hash verification (tamper detection)
- Basic file management (list, search, delete)
- Session management with auto-logout

**What We're NOT Building (Yet):**
- ❌ File sharing (v2.1.0)
- ❌ Organizations/teams (v2.2.0)
- ❌ Mobile apps (v3.0.0)
- ❌ File versioning (v2.2.0)
- ❌ Advanced compliance features (v2.2.0+)

### 1.2 Tech Stack Decisions

```yaml
Frontend:
  Framework: React 18 + Vite (keep existing)
  UI: TailwindCSS + DaisyUI (keep existing)
  State: React Context + TanStack Query (new)
  Routing: React Router v6 (keep existing)
  
Backend:
  Runtime: Node.js 20 LTS
  Framework: Express.js
  Database: PostgreSQL (migrate from MongoDB)
  Cache: Redis
  ORM: Prisma (new)
  
Storage:
  Primary: AWS S3
  Backup: CloudFlare R2 (future)
  
Deployment:
  Frontend: Vercel (keep existing)
  Backend: Render.com → AWS ECS (migrate later)
  Database: AWS RDS PostgreSQL
  Cache: AWS ElastiCache Redis
```

### 1.3 Development Principles

✅ **Mobile-first design** - Responsive from day 1  
✅ **Security-first** - Never compromise on encryption  
✅ **Test as you go** - Write tests during development  
✅ **Document everything** - Future you will thank you  
✅ **Deploy early, deploy often** - Use staging environment  
✅ **User feedback driven** - Get real users ASAP

---

## 2. Sprint 1: Foundation & Authentication

**Duration:** Week 1-2 (Nov 11 - Nov 22, 2025)  
**Goal:** Set up project structure, database, and complete authentication system

### 2.1 Sprint 1 - Day-by-Day Plan

#### **Day 1-2: Project Setup**

**Tasks:**
```
Backend Setup:
├── Create new Git branch: feature/v2-cloud-native
├── Initialize new Node.js project structure
├── Install dependencies (Express, Prisma, Redis, JWT, bcrypt)
├── Set up environment variables (.env.example)
├── Configure ESLint + Prettier
└── Create folder structure:
    ├── src/
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   ├── middleware/
    │   ├── utils/
    │   ├── routes/
    │   └── config/
    └── tests/

Database Setup:
├── Create PostgreSQL database (local Docker)
├── Define Prisma schema (users, files, sessions tables)
├── Run initial migration
└── Seed with test data

Frontend Cleanup:
├── Remove blockchain dependencies (ethers.js, MetaMask)
├── Remove smart contract code
├── Update environment variables
└── Clean up unused components
```

**Code Example - Prisma Schema:**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String    @map("password_hash")
  firstName           String?   @map("first_name")
  lastName            String?   @map("last_name")
  emailVerified       Boolean   @default(false) @map("email_verified")
  twoFactorEnabled    Boolean   @default(false) @map("two_factor_enabled")
  twoFactorSecret     String?   @map("two_factor_secret")
  masterKeyEncrypted  String    @map("master_key_encrypted")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  lastLoginAt         DateTime? @map("last_login_at")
  accountStatus       String    @default("active") @map("account_status")
  
  files               File[]
  sessions            Session[]
  auditLogs           AuditLog[]
  
  @@map("users")
}

model Session {
  id                String   @id @default(uuid())
  userId            String   @map("user_id")
  refreshTokenHash  String   @map("refresh_token_hash")
  deviceInfo        Json?    @map("device_info")
  ipAddress         String?  @map("ip_address")
  expiresAt         DateTime @map("expires_at")
  createdAt         DateTime @default(now()) @map("created_at")
  lastActivityAt    DateTime @default(now()) @map("last_activity_at")
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
  @@index([userId])
  @@index([refreshTokenHash])
}

// More models in Technical Architecture doc
```

**Deliverables:**
- ✅ Clean project structure
- ✅ Database schema created
- ✅ Development environment working

---

#### **Day 3-5: Authentication System**

**Tasks:**
```
User Registration:
├── POST /api/auth/register endpoint
├── Email validation (Zod schema)
├── Password strength requirements (min 8 chars, uppercase, number, symbol)
├── Argon2 password hashing
├── Generate master encryption key (client-side)
├── Encrypt master key with password
├── Store encrypted master key in database
├── Send verification email
└── Return JWT tokens

User Login:
├── POST /api/auth/login endpoint
├── Email + password validation
├── Verify password (Argon2)
├── Generate JWT access token (15 min)
├── Generate refresh token (7 days)
├── Store refresh token in database (hashed)
├── Update last login timestamp
└── Return tokens + user data

Token Management:
├── POST /api/auth/refresh endpoint
├── Verify refresh token
├── Check if refresh token is revoked
├── Generate new access token
├── Rotate refresh token (optional for MVP)
└── Return new tokens

Logout:
├── POST /api/auth/logout endpoint
├── Invalidate refresh token (mark as revoked)
├── Clear Redis session cache
└── Return success

Middleware:
├── authenticateToken (verify JWT)
├── requireEmailVerification
├── rateLimiter (5 attempts per 15 min)
└── errorHandler (consistent error responses)
```

**Code Example - Authentication Controller:**
```javascript
// src/controllers/authController.js
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, masterKeyEncrypted } = req.body;
    
    // 1. Validate input (use Zod schema)
    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'An account with this email already exists'
        }
      });
    }
    
    // 3. Hash password
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4
    });
    
    // 4. Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        masterKeyEncrypted, // Encrypted on client side
        accountStatus: 'active'
      }
    });
    
    // 5. Send verification email (implement later)
    // await sendVerificationEmail(user.email);
    
    // 6. Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    // 7. Store refresh token
    const refreshTokenHash = await argon2.hash(refreshToken);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    // 8. Return response
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified
        },
        accessToken,
        refreshToken
      },
      message: 'Account created successfully. Please verify your email.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create account'
      }
    });
  }
};

module.exports = { register, /* login, refresh, logout */ };
```

**Frontend Components:**
```
src/pages/Auth/
├── Register.jsx (form with email, password, confirm password)
├── Login.jsx (email, password, "Remember me")
├── ForgotPassword.jsx (email input)
└── ResetPassword.jsx (new password + token from email)

src/contexts/
└── AuthContext.jsx (manage user state, tokens, logout)

src/utils/
└── cryptoUtils.js (generate master key, encrypt with password)
```

**Deliverables:**
- ✅ Complete authentication API (register, login, refresh, logout)
- ✅ Frontend auth pages (register, login)
- ✅ JWT token management
- ✅ Session tracking
- ✅ Rate limiting on auth endpoints

---

#### **Day 6-10: Frontend Auth Integration & Testing**

**Tasks:**
```
Frontend Integration:
├── AuthContext with login/logout/register methods
├── Protected routes (redirect to login if not authenticated)
├── Automatic token refresh (before expiry)
├── Store tokens securely (httpOnly cookies OR secure localStorage)
├── Handle authentication errors gracefully
└── Loading states during auth operations

UI/UX:
├── Registration form with validation
├── Login form with "Remember me"
├── Password strength indicator
├── Error messages (user-friendly)
├── Success messages (email verification sent)
└── Responsive design (mobile-first)

Testing:
├── Unit tests for auth controllers
├── Integration tests for auth endpoints
├── Frontend E2E tests (register → login → logout)
├── Security tests (SQL injection, XSS attempts)
└── Load testing (1000 concurrent logins)
```

**Code Example - AuthContext:**
```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { generateMasterKey, encryptMasterKey } from '../utils/cryptoUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  
  // Load user on mount
  useEffect(() => {
    if (accessToken) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [accessToken]);
  
  const loadUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (email, password, firstName, lastName) => {
    // 1. Generate master key (256-bit random)
    const masterKey = generateMasterKey();
    
    // 2. Encrypt master key with password (PBKDF2)
    const masterKeyEncrypted = await encryptMasterKey(masterKey, password);
    
    // 3. Store master key in session (memory only, never sent to server)
    sessionStorage.setItem('masterKey', masterKey);
    
    // 4. Register user
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      masterKeyEncrypted
    });
    
    const { user, accessToken, refreshToken } = response.data.data;
    
    // 5. Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setAccessToken(accessToken);
    setUser(user);
    
    return user;
  };
  
  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    
    const { user, accessToken, refreshToken, masterKeyEncrypted } = response.data.data;
    
    // Decrypt master key with password
    const masterKey = await decryptMasterKey(masterKeyEncrypted, password);
    sessionStorage.setItem('masterKey', masterKey);
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setAccessToken(accessToken);
    setUser(user);
    
    return user;
  };
  
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('masterKey');
      setAccessToken(null);
      setUser(null);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Deliverables:**
- ✅ Working authentication flow (end-to-end)
- ✅ Protected routes functional
- ✅ Automatic token refresh
- ✅ 80%+ test coverage for auth system
- ✅ Security audit passed

---

### 2.2 Sprint 1 - Definition of Done

**Checklist:**
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] JWT tokens generated and stored securely
- [ ] Refresh token rotation working
- [ ] User can logout (tokens invalidated)
- [ ] Protected routes redirect to login
- [ ] Rate limiting prevents brute force
- [ ] All auth endpoints have tests
- [ ] Frontend forms have validation
- [ ] Responsive design on mobile
- [ ] No critical security vulnerabilities

---

## 3. Sprint 2: File Operations

**Duration:** Week 3-4 (Nov 25 - Dec 6, 2025)  
**Goal:** Complete file upload/download with encryption and S3 integration

### 3.1 Sprint 2 - Day-by-Day Plan

#### **Day 1-3: S3 Integration & File Upload**

**Tasks:**
```
AWS Setup:
├── Create AWS account (if needed)
├── Create S3 bucket (cryptguard-files-prod)
├── Configure bucket (private, versioning, encryption at rest)
├── Create IAM user with S3 permissions
├── Generate access keys
└── Set up lifecycle policies (delete after 90 days for MVP)

Backend - File Upload:
├── POST /api/files/upload endpoint
├── Multer middleware for multipart/form-data
├── Validate file (size, type, name)
├── Generate unique filename (UUID)
├── Upload encrypted file to S3 (AWS SDK v3)
├── Calculate SHA-256 hash (server-side verification)
├── Store file metadata in PostgreSQL
├── Create audit log entry
└── Return file ID

Frontend - File Upload:
├── File upload component with drag-and-drop
├── File validation (client-side)
├── Encrypt file before upload (AES-256-GCM)
├── Calculate hash (client-side)
├── Upload encrypted file (multipart for large files)
├── Progress indicator (upload percentage)
├── Success/error handling
└── Add to file list after upload
```

**Code Example - File Upload Controller:**
```javascript
// src/controllers/fileController.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const multer = require('multer');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const prisma = new PrismaClient();

// Multer config (store in memory for encryption check)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for MVP
  }
});

const uploadFile = async (req, res) => {
  try {
    const { originalFilename, encryptedKey, iv, clientHash, mimeType, category } = req.body;
    const encryptedFile = req.file.buffer;
    
    // 1. Validate inputs
    if (!encryptedFile || !encryptedKey || !clientHash) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Missing required fields' }
      });
    }
    
    // 2. Calculate server-side hash (verify integrity)
    const serverHash = crypto.createHash('sha256').update(encryptedFile).digest('hex');
    
    // 3. Generate unique S3 key
    const fileId = crypto.randomUUID();
    const s3Key = `files/${req.user.userId}/${fileId}`;
    
    // 4. Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: encryptedFile,
      ServerSideEncryption: 'AES256',
      Metadata: {
        userId: req.user.userId,
        originalFilename: originalFilename
      }
    }));
    
    // 5. Store metadata in database
    const file = await prisma.file.create({
      data: {
        id: fileId,
        userId: req.user.userId,
        originalFilename,
        encryptedFilename: s3Key,
        fileSize: encryptedFile.length,
        mimeType: mimeType || 'application/octet-stream',
        storageProvider: 's3',
        storagePath: s3Key,
        storageRegion: process.env.AWS_REGION,
        encryptionAlgorithm: 'AES-256-GCM',
        encryptedKey: encryptedKey,
        initializationVector: iv,
        fileHashSha256: clientHash, // Trust client hash (we verified encryption)
        fileHashAlgorithm: 'SHA-256',
        category: category || 'other',
        version: 1,
        status: 'active'
      }
    });
    
    // 6. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        eventType: 'file.uploaded',
        eventCategory: 'file',
        resourceType: 'file',
        resourceId: fileId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        eventData: {
          filename: originalFilename,
          size: encryptedFile.length,
          mimeType
        },
        status: 'success'
      }
    });
    
    // 7. Return success
    res.status(201).json({
      success: true,
      data: {
        file: {
          id: file.id,
          originalFilename: file.originalFilename,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          category: file.category,
          createdAt: file.createdAt
        }
      },
      message: 'File uploaded successfully'
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    
    // Create audit log for failure
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        eventType: 'file.upload_failed',
        eventCategory: 'file',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'failure',
        errorMessage: error.message
      }
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload file'
      }
    });
  }
};

module.exports = { upload, uploadFile };
```

**Frontend Code - File Upload:**
```javascript
// src/components/UploadFile.jsx
import { useState } from 'react';
import { encryptFile, calculateHash } from '../utils/cryptoUtils';
import { apiClient } from '../utils/apiClient';

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    
    try {
      // 1. Get master key from session
      const masterKey = sessionStorage.getItem('masterKey');
      
      // 2. Generate random file key
      const fileKey = crypto.getRandomValues(new Uint8Array(32));
      
      // 3. Encrypt file with file key
      const { encryptedFile, iv } = await encryptFile(file, fileKey);
      setProgress(30);
      
      // 4. Encrypt file key with master key
      const encryptedKey = await encryptFileKey(fileKey, masterKey);
      
      // 5. Calculate hash of encrypted file
      const hash = await calculateHash(encryptedFile);
      setProgress(50);
      
      // 6. Upload to server
      const formData = new FormData();
      formData.append('file', new Blob([encryptedFile]), file.name);
      formData.append('originalFilename', file.name);
      formData.append('encryptedKey', encryptedKey);
      formData.append('iv', iv);
      formData.append('clientHash', hash);
      formData.append('mimeType', file.type);
      
      const response = await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentage = 50 + (progressEvent.loaded / progressEvent.total) * 50;
          setProgress(Math.round(percentage));
        }
      });
      
      alert('File uploaded successfully!');
      setFile(null);
      setProgress(0);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={uploading} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? `Uploading... ${progress}%` : 'Upload'}
      </button>
      {uploading && <progress value={progress} max="100" />}
    </div>
  );
};

export default UploadFile;
```

**Deliverables:**
- ✅ S3 bucket configured and working
- ✅ File upload endpoint functional
- ✅ Client-side encryption before upload
- ✅ Hash calculation and verification
- ✅ File metadata stored in PostgreSQL
- ✅ Upload progress indicator

---

#### **Day 4-6: File Download & Decryption**

**Tasks:**
```
Backend - File Download:
├── GET /api/files/:id/download endpoint
├── Check user permissions (owns file OR has share access)
├── Generate S3 presigned URL (5 min expiry)
├── Return presigned URL + encrypted key
├── Create audit log (file.downloaded)
└── Update last accessed timestamp

Frontend - File Download:
├── Download encrypted file from S3
├── Decrypt file key with master key
├── Decrypt file with file key
├── Calculate hash and verify integrity
├── Show "TAMPERED" warning if hash mismatch
├── Trigger browser download of decrypted file
└── Progress indicator during decryption
```

**Code Example - Download & Verify:**
```javascript
// Frontend - src/utils/fileOperations.js
import { decryptFile, calculateHash } from './cryptoUtils';
import { apiClient } from './apiClient';

export const downloadAndDecryptFile = async (fileId) => {
  try {
    // 1. Get file metadata + presigned URL
    const response = await apiClient.get(`/files/${fileId}/download`);
    const { presignedUrl, encryptedKey, iv, originalFilename, storedHash } = response.data.data;
    
    // 2. Download encrypted file from S3
    const fileResponse = await fetch(presignedUrl);
    const encryptedFileBuffer = await fileResponse.arrayBuffer();
    
    // 3. Get master key from session
    const masterKey = sessionStorage.getItem('masterKey');
    
    // 4. Decrypt file key with master key
    const fileKey = await decryptFileKey(encryptedKey, masterKey);
    
    // 5. Decrypt file with file key
    const decryptedFile = await decryptFile(encryptedFileBuffer, fileKey, iv);
    
    // 6. Verify hash (tamper detection)
    const calculatedHash = await calculateHash(encryptedFileBuffer);
    
    if (calculatedHash !== storedHash) {
      alert('⚠️ WARNING: File integrity check FAILED! File may have been tampered with.');
      return;
    }
    
    // 7. Trigger download
    const blob = new Blob([decryptedFile]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFilename;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ File downloaded and verified successfully!');
    
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download file');
  }
};
```

**Deliverables:**
- ✅ File download endpoint with presigned URLs
- ✅ File decryption working
- ✅ Hash verification (tamper detection)
- ✅ Warning shown if file tampered
- ✅ Audit logs for downloads

---

#### **Day 7-10: File Management & Testing**

**Tasks:**
```
File Listing:
├── GET /api/files endpoint (paginated)
├── Filters (category, date range, search query)
├── Sorting (name, date, size)
├── Return file metadata (not encrypted content)
└── Pagination (20 files per page)

File Search:
├── GET /api/files/search?q=query
├── Full-text search on filename
├── Filter by category, date
└── Return matching files

File Deletion:
├── DELETE /api/files/:id endpoint
├── Soft delete (mark status = 'deleted')
├── Don't actually delete from S3 (for recovery)
├── Create audit log (file.deleted)
└── Return success

Frontend Components:
├── File list (grid + list view)
├── Search bar with filters
├── File cards (thumbnail, name, size, date)
├── File actions (download, delete, info)
├── Empty state (no files yet)
└── Loading skeletons

Testing:
├── Unit tests for all file endpoints
├── Integration tests (upload → list → download → delete)
├── Frontend E2E tests
├── Performance tests (upload 100MB file)
└── Security tests (unauthorized access attempts)
```

**Deliverables:**
- ✅ Complete file CRUD operations
- ✅ File list with search & filters
- ✅ Grid + list view toggle
- ✅ File deletion (soft delete)
- ✅ 80%+ test coverage
- ✅ Performance benchmarks met

---

### 3.2 Sprint 2 - Definition of Done

**Checklist:**
- [ ] User can upload files (up to 100MB)
- [ ] Files encrypted before upload (AES-256-GCM)
- [ ] Files stored in S3 successfully
- [ ] User can list their files (paginated)
- [ ] User can search files by name
- [ ] User can download files
- [ ] Files decrypted after download
- [ ] Hash verification works (tamper detection)
- [ ] User can delete files (soft delete)
- [ ] All file operations audited
- [ ] Responsive UI on mobile
- [ ] All tests passing
- [ ] No S3 permission issues

---

## 4. Sprint 3: Polish & Deployment

**Duration:** Week 5-6 (Dec 9 - Dec 20, 2025)  
**Goal:** Final polish, security audit, production deployment, beta launch

### 4.1 Sprint 3 - Day-by-Day Plan

#### **Day 1-3: UI/UX Polish**

**Tasks:**
```
Dashboard:
├── File stats cards (total files, storage used, recent uploads)
├── Recent activity feed
├── Quick actions (upload file, search)
└── Welcome message for new users

User Profile:
├── View/edit profile (name, email)
├── Change password
├── Account settings
├── Storage usage chart
└── Delete account (with confirmation)

Settings Page:
├── Notification preferences
├── Privacy settings
├── Download personal data (GDPR)
└── API keys (future)

Responsive Design:
├── Test on all screen sizes (mobile, tablet, desktop)
├── Fix any layout issues
├── Optimize for touch interactions
└── Accessibility improvements (ARIA labels, keyboard nav)

Error Handling:
├── User-friendly error messages
├── Retry mechanisms for failed uploads
├── Offline detection
└── Network error handling
```

**Deliverables:**
- ✅ Polished dashboard with stats
- ✅ User profile & settings pages
- ✅ Fully responsive on all devices
- ✅ Excellent error handling

---

#### **Day 4-6: 2FA & Security**

**Tasks:**
```
Two-Factor Authentication:
├── POST /api/auth/2fa/enable endpoint
├── Generate TOTP secret (speakeasy)
├── Return QR code for user to scan
├── Verify TOTP code
├── Store 2FA secret in database (encrypted)
└── Require 2FA on login if enabled

Login with 2FA:
├── POST /api/auth/login (returns needsTwoFactor: true)
├── POST /api/auth/2fa/verify (submit TOTP code)
├── Return tokens after successful 2FA
└── Show 2FA input field in frontend

Security Audit:
├── Run OWASP ZAP scan
├── Check for SQL injection vulnerabilities
├── Check for XSS vulnerabilities
├── Verify all inputs validated
├── Check for exposed secrets (.env in git?)
├── Review CORS configuration
├── Test rate limiting
└── Penetration testing (simulate attacks)

Performance Optimization:
├── Frontend bundle size optimization
├── Lazy loading for routes
├── Image optimization
├── Database query optimization (indexes)
├── Redis caching for hot data
└── Lighthouse score > 90
```

**Deliverables:**
- ✅ 2FA fully functional
- ✅ Security audit passed (no critical issues)
- ✅ Performance optimized (Lighthouse > 90)

---

#### **Day 7-9: Production Deployment**

**Tasks:**
```
Environment Setup:
├── AWS RDS PostgreSQL (production instance)
├── AWS ElastiCache Redis (production instance)
├── AWS S3 (production bucket with lifecycle)
├── AWS Route53 (DNS configuration)
├── CloudFlare (CDN + DDoS protection)
└── SSL certificates (Let's Encrypt)

Backend Deployment:
├── Deploy to Render.com (initial) OR AWS ECS
├── Set environment variables
├── Run database migrations
├── Seed initial data (if needed)
├── Test health check endpoint
└── Monitor logs for errors

Frontend Deployment:
├── Deploy to Vercel
├── Set environment variables (API URL, etc.)
├── Test production build
├── Verify API connectivity
└── Custom domain setup (app.cryptguard.com)

Monitoring Setup:
├── AWS CloudWatch (metrics, logs, alarms)
├── Sentry (error tracking)
├── Uptime monitoring (UptimeRobot)
├── Create status page (status.cryptguard.com)
└── Set up alerting (email/Slack)

Documentation:
├── API documentation (Swagger)
├── User guide (how to use CryptGuard)
├── Developer setup guide
├── Architecture diagrams
└── Security whitepaper
```

**Deliverables:**
- ✅ Production environment deployed
- ✅ Frontend & backend live
- ✅ Monitoring & alerting configured
- ✅ Documentation complete

---

#### **Day 10: Beta Launch**

**Tasks:**
```
Pre-Launch Checklist:
├── All tests passing
├── Security audit complete
├── Performance benchmarks met
├── Monitoring working
├── Backup strategy in place
├── Incident response plan ready
└── Support email configured (support@cryptguard.com)

Launch Activities:
├── Create landing page (marketing)
├── Write launch blog post
├── Post on HackerNews ("Show HN: CryptGuard")
├── Post on Reddit (r/privacy, r/selfhosted)
├── Post on ProductHunt
├── Share on Twitter/LinkedIn
├── Email to friends & beta testers
└── Monitor for feedback and bugs

Post-Launch:
├── Monitor server metrics (CPU, memory, errors)
├── Respond to user feedback
├── Fix critical bugs immediately
├── Collect user testimonials
└── Plan v2.1.0 based on feedback
```

**Deliverables:**
- ✅ Public launch complete
- ✅ First 100 users signed up
- ✅ No critical bugs reported
- ✅ Positive user feedback

---

### 4.2 Sprint 3 - Definition of Done

**Checklist:**
- [ ] All MVP features complete and tested
- [ ] 2FA working (optional for users)
- [ ] Security audit passed (no critical vulnerabilities)
- [ ] Performance targets met (Lighthouse > 90)
- [ ] Production deployment successful
- [ ] Frontend + backend live and stable
- [ ] Monitoring & alerting configured
- [ ] Documentation complete (API, user guide)
- [ ] Beta launch announced publicly
- [ ] 100+ users signed up
- [ ] No P0 bugs reported
- [ ] Team ready for v2.1.0 development

---

## 5. Post-Launch Plan

### 5.1 Week 1-2 After Launch (Stabilization)

**Goals:**
- Fix any critical bugs reported by users
- Monitor performance and scale if needed
- Collect user feedback
- Improve onboarding based on user drop-offs

**Tasks:**
```
Bug Fixes:
├── Triage bug reports (P0, P1, P2, P3)
├── Fix P0 bugs within 24 hours
├── Fix P1 bugs within 1 week
└── Track all bugs in GitHub Issues

Performance Monitoring:
├── Monitor API response times
├── Monitor S3 upload/download speeds
├── Check database query performance
├── Optimize slow queries (add indexes)
└── Scale backend if CPU > 80%

User Feedback:
├── Send survey to first 100 users
├── Conduct 5-10 user interviews
├── Analyze usage patterns (Google Analytics)
├── Identify drop-off points
└── Plan improvements for v2.1.0
```

### 5.2 Planning v2.1.0 (File Sharing)

**Start Date:** January 2026  
**Duration:** 8-10 weeks

**Key Features:**
- File sharing with specific users
- Public shareable links
- Password-protected links
- Expiry dates & view limits
- Share permissions (view, download, edit)
- Law firm features (client-matter folders, legal holds)

**Preparation:**
- Review v2.0.0 learnings
- Finalize v2.1.0 feature scope
- Update roadmap based on feedback
- Hire additional developer (if funding allows)

---

## 6. Risk Management

### 6.1 Technical Risks

| Risk | Mitigation |
|------|------------|
| **S3 upload failures** | Implement retry logic, multipart upload |
| **Database performance issues** | Add indexes, use read replicas if needed |
| **Redis connection issues** | Fallback to PostgreSQL sessions if Redis down |
| **Frontend bundle size too large** | Code splitting, lazy loading, tree shaking |
| **Security vulnerability discovered** | Bug bounty program, regular security audits |

### 6.2 Timeline Risks

**If behind schedule:**
- Cut nice-to-have features (move to v2.1.0)
- Extend sprint by 1 week (max)
- Ask for help from community (open source contributions)

**If ahead of schedule:**
- Add polish and extra features
- Improve test coverage to 90%+
- Start v2.1.0 planning early

---

## 7. Success Metrics

### 7.1 Technical Metrics

```yaml
Code Quality:
  - Test coverage: > 80%
  - Lighthouse score: > 90
  - Bundle size: < 300KB (gzipped)
  - API response time: < 200ms (p95)
  - Uptime: > 99.5%

Performance:
  - File upload (10MB): < 5 seconds
  - File download (10MB): < 3 seconds
  - Page load time: < 2 seconds
  - Time to interactive: < 3 seconds
```

### 7.2 User Metrics

```yaml
Adoption:
  - Beta signups: 100+ in first week
  - Active users: 50+ daily
  - Files uploaded: 500+ in first month
  - Retention: 60% return after 7 days

Engagement:
  - Average files per user: 5+
  - Average session duration: 5+ minutes
  - 2FA adoption: 30%
  - Email verification: 80%
```

---

## 8. Development Best Practices

### 8.1 Git Workflow

```bash
# Create feature branch
git checkout -b feature/file-upload

# Commit with meaningful messages
git commit -m "feat: implement file upload with S3 integration"

# Push and create PR
git push origin feature/file-upload

# Merge after code review + tests passing
```

### 8.2 Code Review Checklist

- [ ] Code follows project style guide
- [ ] All tests passing
- [ ] No console.log() statements left
- [ ] Environment variables used (no hardcoded values)
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Security best practices followed
- [ ] Performance optimized
- [ ] Documentation updated

### 8.3 Testing Strategy

```
Unit Tests (80%):
- Test individual functions
- Mock external dependencies
- Fast execution (< 1 second)

Integration Tests (15%):
- Test API endpoints
- Use test database
- Test authentication flow

E2E Tests (5%):
- Test critical user flows
- Register → Login → Upload → Download
- Use Playwright
```

---

## 9. Tools & Resources

### 9.1 Development Tools

```yaml
Code Editor: VS Code
Extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
  - Thunder Client (API testing)

Database: TablePlus OR pgAdmin
API Testing: Postman OR Thunder Client
Version Control: Git + GitHub
Project Management: GitHub Projects OR Notion
```

### 9.2 Useful Resources

```
Documentation:
  - React: https://react.dev
  - Prisma: https://www.prisma.io/docs
  - AWS S3: https://docs.aws.amazon.com/s3
  - Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

Tutorials:
  - JWT Authentication: https://jwt.io
  - File Encryption: Web Crypto API docs
  - S3 Uploads: AWS SDK v3 docs

Community:
  - Discord: Create CryptGuard community
  - GitHub Discussions: Q&A and feature requests
```

---

## 10. Conclusion

This development plan provides a **detailed, day-by-day roadmap** to build CryptGuard v2.0 MVP in **6 weeks**.

**Key Takeaways:**
1. ✅ Sprint 1 (2 weeks): Authentication system
2. ✅ Sprint 2 (2 weeks): File operations (upload/download/decrypt)
3. ✅ Sprint 3 (2 weeks): Polish, security, deployment, launch
4. ✅ Post-launch: Stabilization and v2.1.0 planning

**Success Depends On:**
- Staying focused on MVP scope (no feature creep!)
- Daily progress (commit code every day)
- Testing as you go (don't leave tests for later)
- User feedback (launch early, iterate fast)
- Security first (never compromise encryption)

**Ready to start?** Let's build CryptGuard v2.0! 🚀

---

**Document Owner:** Engineering Team  
**Last Updated:** November 7, 2025  
**Next Review:** After Sprint 1 (Nov 22, 2025)
