# Software Requirements Specification (SRS)
## CryptGuard v2.0 - Cloud-Native Secure File Storage Platform

**Document Version:** 1.0  
**Date:** November 7, 2025  
**Author:** CryptGuard Development Team  
**Status:** Draft

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Use Cases](#5-use-cases)
6. [System Features](#6-system-features)
7. [External Interface Requirements](#7-external-interface-requirements)

---

## 1. Introduction

### 1.1 Purpose
This SRS document specifies the requirements for CryptGuard v2.0, a cloud-native, zero-knowledge encrypted file storage platform designed for professionals requiring high security, compliance, and file integrity verification.

### 1.2 Scope
CryptGuard v2.0 will provide:
- **Zero-knowledge encryption** (client-side encryption)
- **Multi-factor authentication** (email/password + 2FA)
- **Tamper detection** using cryptographic hashing
- **Industry-specific templates** (law firms, healthcare, forensics)
- **Compliance features** (HIPAA, GDPR, audit logs)
- **Advanced file sharing** with permissions and expiry
- **Mobile-responsive web app** with PWA capabilities

### 1.3 Definitions & Acronyms
- **Zero-Knowledge**: Server cannot decrypt user files
- **Client-Side Encryption**: Files encrypted before upload
- **E2EE**: End-to-End Encryption
- **2FA**: Two-Factor Authentication
- **RBAC**: Role-Based Access Control
- **PWA**: Progressive Web App
- **MVP**: Minimum Viable Product

### 1.4 References
- CryptGuard v1.0 (Blockchain version) - Reference implementation
- OWASP Security Guidelines
- NIST Cryptography Standards
- HIPAA Compliance Requirements
- GDPR Data Protection Regulations

---

## 2. Overall Description

### 2.1 Product Perspective
CryptGuard v2.0 is a **replacement** for the blockchain-based v1.0, pivoting to cloud-native architecture to remove adoption barriers (wallet requirement, slow speeds, high costs) while maintaining security advantages.

**Key Changes from v1.0:**
- ❌ Remove: IPFS, Ethereum blockchain, MetaMask wallet requirement
- ✅ Add: Traditional authentication, cloud storage, organization features
- ✅ Keep: Client-side encryption, tamper detection, security-first design

### 2.2 Product Functions
1. **User Management**
   - Registration with email/password
   - Mandatory 2FA (SMS, Authenticator app)
   - Profile management
   - Session management with auto-logout

2. **File Operations**
   - Upload files (client-side encrypted)
   - Download files (client-side decrypted)
   - Delete files (secure deletion)
   - Version history with hash verification
   - File preview (for supported types)

3. **Security Features**
   - Zero-knowledge encryption (AES-256-GCM)
   - Cryptographic hash verification (SHA-256)
   - Tamper detection and alerts
   - Audit logs (all file access tracked)
   - Automatic security backups

4. **Sharing & Collaboration**
   - Share files with specific users
   - Time-limited sharing (auto-revoke)
   - View-limited sharing (self-destruct)
   - Share with permissions (view/download/edit)
   - Shareable links with password protection

5. **Organization Features**
   - Multi-tenant architecture
   - Team/department folders
   - Role-based access control (Admin, Manager, Member, Guest)
   - Organization-wide policies
   - Compliance dashboards

6. **Industry Templates**
   - Law Firm: Case management, client-matter folders
   - Healthcare: Patient records, HIPAA workflows
   - Forensics: Evidence chains, chain of custody
   - Finance: Document retention, audit trails

### 2.3 User Classes and Characteristics

**Primary Users:**
1. **Individual Users** (Privacy-conscious professionals)
   - Need: Personal encrypted storage
   - Tech Level: Medium
   - Willingness to pay: $10-20/month

2. **Law Firms** (Attorneys, paralegals, admins)
   - Need: Client confidentiality, legal holds, audit trails
   - Tech Level: Low to Medium
   - Willingness to pay: $50-200/user/month

3. **Healthcare Providers** (Doctors, hospitals, clinics)
   - Need: HIPAA compliance, patient privacy
   - Tech Level: Low to Medium
   - Willingness to pay: $30-100/user/month

4. **Digital Forensics** (Investigators, law enforcement)
   - Need: Evidence integrity, chain of custody
   - Tech Level: High
   - Willingness to pay: $100-300/user/month

5. **Enterprise Admins** (IT departments)
   - Need: Centralized management, compliance reporting
   - Tech Level: High
   - Willingness to pay: Custom enterprise pricing

### 2.4 Operating Environment
- **Client**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Server**: Node.js 18+ on cloud infrastructure (AWS, Google Cloud, or Azure)
- **Database**: MongoDB 6+ or PostgreSQL 14+
- **Storage**: AWS S3, Google Cloud Storage, or Azure Blob Storage
- **Mobile**: Progressive Web App (installable on iOS/Android)

### 2.5 Design and Implementation Constraints
- **Client-side encryption mandatory** - No unencrypted files on server
- **Zero-knowledge architecture** - Server never has decryption keys
- **Browser crypto APIs required** - Web Crypto API for encryption
- **HTTPS required** - All communications must be encrypted
- **Compliance requirements** - HIPAA, GDPR, SOC 2 considerations

### 2.6 Assumptions and Dependencies
- Users have stable internet connection
- Users use modern browsers with crypto API support
- Cloud storage provider (AWS S3) available and reliable
- Email service (SendGrid/AWS SES) for notifications
- SMS provider (Twilio) for 2FA

---

## 3. Functional Requirements

### 3.1 User Authentication & Authorization

#### FR-1.1: User Registration
**Priority:** High  
**Description:** Users must be able to create accounts with email and password.

**Requirements:**
- Email validation (format and uniqueness)
- Password strength requirements (min 12 chars, uppercase, lowercase, number, special)
- Email verification via confirmation link
- Automatic master encryption key generation
- Secure key derivation from password (PBKDF2)

**Acceptance Criteria:**
- User receives verification email within 1 minute
- Password must meet strength requirements or registration fails
- Master key generated and encrypted with user password
- User redirected to setup 2FA after verification

#### FR-1.2: Two-Factor Authentication (2FA)
**Priority:** High  
**Description:** All users must enable 2FA before accessing the system.

**Requirements:**
- Support SMS-based 2FA
- Support authenticator app (TOTP - Google Authenticator, Authy)
- Backup codes generation (10 single-use codes)
- 2FA mandatory (cannot be disabled by regular users)

**Acceptance Criteria:**
- User cannot access files until 2FA configured
- SMS code delivered within 30 seconds
- TOTP codes work with standard authenticator apps
- Backup codes downloadable as encrypted file

#### FR-1.3: User Login
**Priority:** High  
**Description:** Users authenticate with email, password, and 2FA code.

**Requirements:**
- Rate limiting (5 failed attempts = 15-minute lockout)
- Session token generation (JWT)
- Refresh token for extended sessions
- "Remember this device" option (30 days)
- Activity logging (IP, device, timestamp)

**Acceptance Criteria:**
- Login successful with correct credentials + 2FA
- Failed login attempts logged and user notified
- Session expires after 15 minutes of inactivity
- User can view active sessions and revoke them

#### FR-1.4: Password Reset
**Priority:** Medium  
**Description:** Users can reset forgotten passwords securely.

**Requirements:**
- Email-based password reset link
- Link expires after 1 hour
- Requires 2FA code even during reset
- Master key re-encryption with new password
- All active sessions invalidated after reset

**Acceptance Criteria:**
- Reset link sent within 1 minute
- Old password cannot be reused
- User notified via email when password changed
- User can regain access within 5 minutes

---

### 3.2 File Upload & Encryption

#### FR-2.1: File Upload
**Priority:** High  
**Description:** Users can upload files of various types and sizes.

**Requirements:**
- Support file types: PDF, DOCX, XLSX, images, videos, archives
- Maximum file size: 5GB per file (configurable)
- Drag-and-drop interface
- Bulk upload (multiple files at once)
- Upload progress indicator with pause/resume

**Acceptance Criteria:**
- Files upload successfully with progress shown
- Large files (>100MB) chunked for reliability
- Upload resumable after network interruption
- User notified of successful upload

#### FR-2.2: Client-Side Encryption
**Priority:** Critical  
**Description:** Files must be encrypted in the browser before upload.

**Requirements:**
- AES-256-GCM encryption algorithm
- Unique encryption key per file (derived from master key)
- Initialization vector (IV) generated randomly per file
- SHA-256 hash calculated before encryption
- Metadata encrypted separately (filename, size, type)

**Acceptance Criteria:**
- Server never receives unencrypted file data
- Encryption happens in Web Worker (non-blocking UI)
- Hash stored for tamper detection
- Decryption possible only with user's master key

#### FR-2.3: File Metadata Storage
**Priority:** High  
**Description:** Encrypted file metadata stored in database.

**Requirements:**
- Store: encrypted filename, size, type, upload date, hash
- Store: cloud storage URL/key (encrypted)
- Store: user ID, organization ID (if applicable)
- Store: sharing permissions and access logs
- Searchable encrypted index (for user's own files)

**Acceptance Criteria:**
- Metadata queryable without decrypting files
- User can search files by name/type/date
- Full audit trail of file access
- Metadata protected with user's master key

---

### 3.3 File Download & Decryption

#### FR-3.1: File Download
**Priority:** High  
**Description:** Users can download and decrypt their files.

**Requirements:**
- Stream file from cloud storage
- Client-side decryption (Web Crypto API)
- Hash verification before presenting file
- Tamper detection alert if hash mismatch
- Download progress indicator

**Acceptance Criteria:**
- File decrypts successfully with correct key
- Hash verification completes before download
- User warned if file tampered (hash mismatch)
- Download works on slow connections

#### FR-3.2: File Preview
**Priority:** Medium  
**Description:** Users can preview files without downloading.

**Requirements:**
- Support previews: PDF, images, text files
- Stream and decrypt on-the-fly
- Zoom/scroll functionality for PDFs
- Preview doesn't trigger full download

**Acceptance Criteria:**
- Preview loads within 3 seconds for files <10MB
- PDF page navigation works smoothly
- Preview secure (no unencrypted cache)

---

### 3.4 File Sharing

#### FR-4.1: Share with Users
**Priority:** High  
**Description:** Users can share files with other registered users.

**Requirements:**
- Select recipient by email (must be registered)
- Set permissions: View, Download, Edit
- Set expiry date (optional)
- Revoke access anytime
- Recipient notified via email

**Acceptance Criteria:**
- Recipient can access shared file immediately
- Permissions enforced (e.g., view-only cannot download)
- Access auto-revoked after expiry
- Audit log tracks all access

#### FR-4.2: Shareable Links
**Priority:** Medium  
**Description:** Users can generate temporary shareable links.

**Requirements:**
- Generate unique URL with secure token
- Optional password protection
- Set expiry date or view limit
- Track link usage (views, downloads)
- Revoke link anytime

**Acceptance Criteria:**
- Link works without recipient account
- Link expires automatically after set time/views
- Password required if set
- Usage statistics visible to owner

---

### 3.5 Organization & Team Features

#### FR-5.1: Organization Management
**Priority:** Medium  
**Description:** Admins can create and manage organizations.

**Requirements:**
- Create organization with name, domain
- Invite users to organization
- Assign roles: Admin, Manager, Member, Guest
- Set organization-wide policies
- View organization usage and billing

**Acceptance Criteria:**
- Admin can invite unlimited users (within plan)
- Users can belong to multiple organizations
- Policies enforced automatically
- Billing calculated per active user

#### FR-5.2: Role-Based Access Control (RBAC)
**Priority:** High  
**Description:** Different user roles have different permissions.

**Requirements:**
- **Admin**: Full access, manage users, view audit logs
- **Manager**: Create folders, invite members, view team files
- **Member**: Upload/download own files, access shared files
- **Guest**: View-only access to specific shared folders (time-limited)

**Acceptance Criteria:**
- Permissions enforced at API level
- Role changes take effect immediately
- Audit logs track role assignments

---

### 3.6 Compliance & Audit

#### FR-6.1: Audit Logs
**Priority:** High  
**Description:** All file access and user actions logged.

**Requirements:**
- Log: User, action, file, timestamp, IP, device
- Actions: upload, download, share, delete, view
- Logs immutable (cannot be edited)
- Logs exportable (CSV, JSON)
- Logs searchable and filterable

**Acceptance Criteria:**
- Every file access logged within 1 second
- Logs retained for compliance period (7 years default)
- Admins can generate compliance reports
- Logs include before/after states for changes

#### FR-6.2: Legal Hold
**Priority:** Medium  
**Description:** Prevent file deletion during legal proceedings.

**Requirements:**
- Admin can place files on legal hold
- Files cannot be deleted while on hold
- Hold status visible to authorized users
- Hold can be released by admin only
- Hold actions logged

**Acceptance Criteria:**
- Delete attempts fail with clear message
- Hold persists even if user leaves organization
- Hold history tracked in audit log

---

### 3.7 Industry-Specific Features

#### FR-7.1: Law Firm Template
**Priority:** Medium  
**Description:** Pre-configured folder structure and workflows for law firms.

**Requirements:**
- Folder structure: Clients → Matters → Documents
- Auto-categorization: Pleadings, Discovery, Correspondence
- Conflict check integration (future)
- Client-matter billing codes
- Attorney-client privilege markers

**Acceptance Criteria:**
- Template applied on organization creation
- Folders auto-created with proper permissions
- Billing codes attached to file uploads

#### FR-7.2: Healthcare Template
**Priority:** Medium  
**Description:** HIPAA-compliant patient record management.

**Requirements:**
- Patient folders with PHI encryption
- Consent tracking (patient authorization)
- Automatic retention policies (per regulation)
- Access logs for HIPAA audit
- Integration with EHR systems (future)

**Acceptance Criteria:**
- PHI automatically identified and encrypted
- Consent required before sharing
- Retention policies auto-applied
- HIPAA audit report generator

---

## 4. Non-Functional Requirements

### 4.1 Performance

#### NFR-1.1: Upload Speed
**Requirement:** Files up to 100MB should upload within 30 seconds on 10 Mbps connection.

#### NFR-1.2: Download Speed
**Requirement:** File download should begin within 2 seconds of request.

#### NFR-1.3: Encryption Overhead
**Requirement:** Encryption should add no more than 10% to file upload time.

#### NFR-1.4: Search Response Time
**Requirement:** File search results displayed within 1 second for up to 10,000 files.

#### NFR-1.5: Page Load Time
**Requirement:** Dashboard loads within 2 seconds on 3G connection.

### 4.2 Security

#### NFR-2.1: Encryption Standard
**Requirement:** AES-256-GCM for file encryption, PBKDF2 for key derivation (100,000 iterations).

#### NFR-2.2: Zero-Knowledge Architecture
**Requirement:** Server must never have access to unencrypted files or master keys.

#### NFR-2.3: Transport Security
**Requirement:** All API communications over HTTPS with TLS 1.3+.

#### NFR-2.4: Password Storage
**Requirement:** Passwords hashed with bcrypt (cost factor 12).

#### NFR-2.5: Session Security
**Requirement:** JWT tokens expire after 15 minutes, refresh tokens after 7 days.

### 4.3 Scalability

#### NFR-3.1: Concurrent Users
**Requirement:** System must support 10,000 concurrent users (MVP), scalable to 1 million.

#### NFR-3.2: Storage Capacity
**Requirement:** System must support petabyte-scale storage (limited by cloud provider).

#### NFR-3.3: Database Performance
**Requirement:** Database queries must complete in <100ms for 99th percentile.

### 4.4 Reliability

#### NFR-4.1: Uptime
**Requirement:** 99.9% uptime (less than 8.76 hours downtime per year).

#### NFR-4.2: Data Durability
**Requirement:** 99.999999999% (11 nines) durability (via cloud storage SLA).

#### NFR-4.3: Backup Frequency
**Requirement:** Database backed up every 6 hours, retained for 30 days.

#### NFR-4.4: Disaster Recovery
**Requirement:** Recovery Time Objective (RTO) < 4 hours, Recovery Point Objective (RPO) < 15 minutes.

### 4.5 Usability

#### NFR-5.1: Ease of Use
**Requirement:** New users should complete first file upload within 5 minutes (no tutorial).

#### NFR-5.2: Accessibility
**Requirement:** WCAG 2.1 Level AA compliance for screen readers and keyboard navigation.

#### NFR-5.3: Mobile Responsiveness
**Requirement:** All features accessible on mobile devices (viewport width 375px+).

#### NFR-5.4: Browser Compatibility
**Requirement:** Support latest 2 versions of Chrome, Firefox, Safari, Edge.

### 4.6 Compliance

#### NFR-6.1: GDPR Compliance
**Requirement:** Right to access, rectification, erasure, and data portability.

#### NFR-6.2: HIPAA Compliance
**Requirement:** PHI encrypted at rest and in transit, audit logs for 7 years.

#### NFR-6.3: SOC 2 Type II
**Requirement:** Annual audit for security, availability, confidentiality.

---

## 5. Use Cases

### UC-1: New User Registration

**Actor:** New User  
**Precondition:** User has valid email address  
**Trigger:** User visits signup page

**Main Flow:**
1. User enters email and password
2. System validates password strength
3. System sends verification email
4. User clicks verification link
5. System generates master encryption key
6. System prompts user to setup 2FA
7. User configures 2FA (SMS or authenticator)
8. System displays backup codes
9. User downloads backup codes
10. User redirected to dashboard

**Alternate Flow:**
- 2a. Password weak → Show strength requirements
- 4a. Link expired → Resend verification email
- 7a. SMS failed → Retry or switch to authenticator

**Postcondition:** User account created with 2FA enabled

---

### UC-2: Upload Encrypted File

**Actor:** Authenticated User  
**Precondition:** User logged in with 2FA  
**Trigger:** User clicks "Upload File" button

**Main Flow:**
1. User selects file from device
2. System calculates file hash (SHA-256)
3. System generates file encryption key
4. System encrypts file (AES-256-GCM)
5. System uploads encrypted file to cloud storage
6. System stores metadata in database (encrypted)
7. System displays success notification

**Alternate Flow:**
- 1a. File too large → Show error message
- 5a. Network error → Retry with exponential backoff
- 5b. Upload interrupted → Allow resume

**Postcondition:** File stored encrypted, metadata saved, hash recorded

---

### UC-3: Download and Verify File

**Actor:** Authenticated User  
**Precondition:** User owns or has access to file  
**Trigger:** User clicks "Download" on file

**Main Flow:**
1. System retrieves encrypted file from cloud storage
2. System retrieves file metadata from database
3. System decrypts file (client-side)
4. System recalculates hash (SHA-256)
5. System compares hash with stored hash
6. System presents file to user for download
7. User saves file to device

**Alternate Flow:**
- 5a. Hash mismatch → Show tamper warning, block download
- 3a. Decryption fails → Show error, check master key

**Postcondition:** File downloaded and verified, access logged

---

### UC-4: Share File with Expiry

**Actor:** File Owner  
**Precondition:** User owns file  
**Trigger:** User clicks "Share" button on file

**Main Flow:**
1. User enters recipient email
2. User selects permissions (view/download)
3. User sets expiry date (e.g., 7 days)
4. System generates sharing record
5. System sends notification email to recipient
6. Recipient logs in and accesses shared file
7. System auto-revokes access after expiry

**Alternate Flow:**
- 1a. Recipient not registered → Show invite option
- 7a. Owner revokes access manually → Access blocked immediately

**Postcondition:** File shared with time-limited access, all access logged

---

### UC-5: Admin Views Audit Logs

**Actor:** Organization Admin  
**Precondition:** Admin role assigned  
**Trigger:** Admin navigates to "Audit Logs" page

**Main Flow:**
1. System displays all organization file access logs
2. Admin filters by user, date range, action type
3. System shows filtered results
4. Admin exports logs as CSV
5. System generates report file
6. Admin downloads report

**Alternate Flow:**
- 2a. No results for filter → Show empty state

**Postcondition:** Admin has compliance report for audit

---

## 6. System Features (Summary)

### 6.1 Core Features (MVP - v2.0)
- ✅ User registration with email/password
- ✅ Mandatory 2FA (SMS + Authenticator)
- ✅ Client-side file encryption (AES-256-GCM)
- ✅ Zero-knowledge architecture
- ✅ File upload/download with tamper detection
- ✅ Basic file sharing (user-to-user)
- ✅ Audit logs (all file access)
- ✅ Session management (15-min timeout)
- ✅ Mobile-responsive UI

### 6.2 Phase 2 Features (v2.1 - Month 2-3)
- ✅ Shareable links with expiry
- ✅ Organization & team management
- ✅ Role-based access control (RBAC)
- ✅ Advanced file search
- ✅ File versioning
- ✅ Bulk operations

### 6.3 Phase 3 Features (v2.2 - Month 4-5)
- ✅ Law firm template
- ✅ Healthcare template
- ✅ Legal hold feature
- ✅ Compliance dashboards
- ✅ PWA conversion (installable app)
- ✅ Offline mode (service workers)

### 6.4 Phase 4 Features (v3.0 - Month 6+)
- ✅ React Native mobile apps
- ✅ Desktop apps (Electron)
- ✅ API for third-party integrations
- ✅ Advanced analytics
- ✅ AI-powered file categorization
- ✅ Blockchain as optional feature (for specific industries)

---

## 7. External Interface Requirements

### 7.1 User Interfaces
- **Web Application**: React 18+ with TailwindCSS and DaisyUI
- **Responsive Design**: Mobile-first (375px to 4K displays)
- **Accessibility**: WCAG 2.1 AA compliant
- **Dark Mode**: Support for system preference

### 7.2 Hardware Interfaces
- **Storage**: AWS S3 / Google Cloud Storage API
- **SMS Gateway**: Twilio API for 2FA codes

### 7.3 Software Interfaces
- **Database**: MongoDB 6+ or PostgreSQL 14+ with encryption at rest
- **Email Service**: SendGrid or AWS SES for transactional emails
- **Authentication**: JWT with refresh tokens
- **Encryption**: Web Crypto API (browser-native)

### 7.4 Communications Interfaces
- **API Protocol**: RESTful API over HTTPS
- **WebSocket**: For real-time notifications (file shared, access granted)
- **API Rate Limiting**: 100 requests/minute per user

---

## Appendix

### A. Success Metrics
- **User Adoption**: 1,000 users in first 6 months
- **Retention**: 70% monthly active users
- **Security**: Zero data breaches
- **Performance**: 99.9% uptime
- **Satisfaction**: NPS score > 50

### B. Risks & Mitigation
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data breach | Critical | Low | Zero-knowledge architecture, regular security audits |
| Cloud provider outage | High | Medium | Multi-region deployment, automatic failover |
| Slow adoption | Medium | Medium | Freemium model, marketing to target industries |
| Encryption performance | Low | Low | Web Workers, chunked uploads |

### C. Approval
- **Prepared By:** CryptGuard Development Team
- **Reviewed By:** Saurabh Jadhav
- **Approved By:** Saurabh Jadhav
- **Date:** November 7, 2025

---

**End of Document**
