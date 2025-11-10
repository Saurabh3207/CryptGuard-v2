# CryptGuard v2.0 - Compliance Framework Mapping

**Date:** November 10, 2025  
**Classification:** Compliance Reference  
**Purpose:** Map security controls to industry standards & regulations

---

## 🎯 Compliance Overview

**Why Compliance Matters:**
- Legal requirement (HIPAA, GDPR, etc.)
- Customer trust (certifications prove security)
- Insurance (lower cyber insurance premiums)
- Contracts (enterprise customers require SOC 2)
- Liability protection (show due diligence)

---

## 📋 Compliance Frameworks

### **1. SOC 2 Type II (Trust Service Criteria)**

**What:** Audit of security controls by independent CPA firm  
**Who Needs It:** Any SaaS company serving businesses  
**Timeline:** 6-12 months to achieve  
**Cost:** $20,000-100,000 (audit fees)  

#### SOC 2 Trust Service Criteria:

| Criteria | CryptGuard Implementation | Status |
|----------|---------------------------|--------|
| **Security** | Encryption, MFA, access controls | ✅ Implemented |
| **Availability** | 99.9% uptime, redundancy, backups | ✅ Implemented |
| **Processing Integrity** | Hash verification, audit logs | ✅ Implemented |
| **Confidentiality** | Zero-knowledge encryption | ✅ Implemented |
| **Privacy** | GDPR compliant, data minimization | ✅ Implemented |

#### Control Mapping:

```javascript
// CC6.1: Logical and Physical Access Controls
const SOC2_CC6_1 = {
  control: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events',
  
  cryptguardImplementation: {
    mfa: 'TOTP + hardware keys (FIDO2)',
    passwordPolicy: 'NIST 800-63B compliant (12+ chars, complexity)',
    sessionManagement: '15-min timeout, device fingerprinting',
    accessControl: 'Role-based (RBAC), principle of least privilege',
    networkSecurity: 'TLS 1.3, certificate pinning, firewalls',
    monitoring: 'Real-time alerts, intrusion detection'
  },
  
  evidence: [
    'Authentication logs',
    'Access control policies',
    'Session audit logs',
    'Failed login attempt logs',
    'MFA enrollment reports'
  ]
};

// CC7.2: System Monitoring
const SOC2_CC7_2 = {
  control: 'The entity monitors system components and the operation of those components for anomalies',
  
  cryptguardImplementation: {
    monitoring: 'Prometheus + Grafana (real-time dashboards)',
    logging: 'Centralized logging (ELK stack)',
    alerting: 'PagerDuty (critical), Slack (high/medium)',
    anomalyDetection: 'ML-based (unusual login patterns, data exfiltration)',
    incidentResponse: 'Runbooks, escalation procedures'
  },
  
  evidence: [
    'Monitoring dashboards',
    'Alert logs',
    'Incident response reports',
    'Security event logs'
  ]
};

// CC8.1: Change Management
const SOC2_CC8_1 = {
  control: 'The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data backup processes, and recovery infrastructure',
  
  cryptguardImplementation: {
    changeControl: 'Git flow, pull requests, code review (2+ approvals)',
    testing: 'Unit tests, integration tests, security scans',
    deployment: 'CI/CD pipeline, automated testing, rollback capability',
    backups: '3-2-1 backup strategy, daily + weekly + monthly',
    disasterRecovery: 'RTO < 4 hours, RPO < 1 hour'
  },
  
  evidence: [
    'Git commit history',
    'Pull request approvals',
    'Test coverage reports',
    'Backup logs',
    'DR test results'
  ]
};
```

---

### **2. ISO 27001 (Information Security Management)**

**What:** International standard for information security management  
**Who Needs It:** Global enterprises, government contractors  
**Timeline:** 12-18 months to achieve  
**Cost:** $50,000-200,000  

#### ISO 27001 Controls (Annex A):

| Control Category | CryptGuard Controls | Evidence |
|------------------|---------------------|----------|
| **A.5: Information Security Policies** | Security policy document, regular reviews | Policy docs, review logs |
| **A.8: Asset Management** | File metadata tracking, data classification | Asset inventory |
| **A.9: Access Control** | RBAC, MFA, session management | Access logs |
| **A.10: Cryptography** | AES-256, TLS 1.3, key management | Encryption audit |
| **A.12: Operations Security** | Malware protection, backups, logging | Backup logs, AV reports |
| **A.13: Communications Security** | TLS, VPN, network segmentation | Network configs |
| **A.14: System Acquisition** | Secure SDLC, code review, vulnerability scanning | Dev process docs |
| **A.16: Incident Management** | Incident response plan, post-mortems | Incident reports |
| **A.17: Business Continuity** | DR plan, backup/restore tests | DR test results |
| **A.18: Compliance** | Legal review, privacy impact assessments | Compliance reports |

---

### **3. HIPAA (Health Insurance Portability and Accountability Act)**

**What:** US law protecting medical information (PHI)  
**Who Needs It:** Healthcare providers, health tech companies  
**Timeline:** 3-6 months to achieve  
**Cost:** $10,000-50,000 (implementation + BAA)  

#### HIPAA Security Rule Requirements:

##### Administrative Safeguards:

```javascript
const HIPAA_ADMINISTRATIVE = {
  '164.308(a)(1)': {
    requirement: 'Security Management Process',
    implementation: {
      riskAssessment: 'Annual security risk assessments',
      riskManagement: 'Risk mitigation plans, tracking',
      sanctions: 'Employee disciplinary policy for violations',
      reviewRecords: 'Audit log review (daily automated, weekly manual)'
    }
  },
  
  '164.308(a)(3)': {
    requirement: 'Workforce Security',
    implementation: {
      authorization: 'Role-based access, principle of least privilege',
      supervision: 'Manager approval for access changes',
      termination: 'Immediate access revocation on termination'
    }
  },
  
  '164.308(a)(4)': {
    requirement: 'Information Access Management',
    implementation: {
      accessEstablishment: 'Formal access request/approval process',
      accessModification: 'Quarterly access reviews',
      workstationSecurity: 'Locked screens, encrypted workstations'
    }
  },
  
  '164.308(a)(5)': {
    requirement: 'Security Awareness Training',
    implementation: {
      training: 'Annual HIPAA training for all employees',
      phishing: 'Quarterly phishing simulations',
      incidentReporting: 'Clear reporting procedures'
    }
  },
  
  '164.308(a)(6)': {
    requirement: 'Security Incident Procedures',
    implementation: {
      response: 'Incident response plan, runbooks',
      reporting: 'Breach notification within 60 days (if >500 individuals)'
    }
  },
  
  '164.308(a)(7)': {
    requirement: 'Contingency Plan',
    implementation: {
      backups: '3-2-1 backup strategy, daily backups',
      disasterRecovery: 'DR plan, quarterly tests',
      emergencyMode: 'Read-only mode if systems compromised'
    }
  }
};
```

##### Physical Safeguards:

```javascript
const HIPAA_PHYSICAL = {
  '164.310(a)(1)': {
    requirement: 'Facility Access Controls',
    implementation: {
      accessControl: 'Badge access, visitor logs',
      validation: 'Background checks for datacenter personnel'
    }
  },
  
  '164.310(b)': {
    requirement: 'Workstation Use',
    implementation: {
      policy: 'Clean desk policy, screen privacy filters',
      monitoring: 'Screen recording for audit purposes'
    }
  },
  
  '164.310(d)': {
    requirement: 'Device and Media Controls',
    implementation: {
      disposal: 'Secure wiping (DoD 5220.22-M), physical destruction',
      mediaReuse: 'Cryptographic erasure before reuse',
      accountability: 'Hardware inventory, tracking'
    }
  }
};
```

##### Technical Safeguards:

```javascript
const HIPAA_TECHNICAL = {
  '164.312(a)(1)': {
    requirement: 'Access Control',
    implementation: {
      uniqueUserID: 'No shared accounts, individual user IDs',
      emergencyAccess: 'Break-glass accounts (logged)',
      autoLogoff: '15-minute inactivity timeout',
      encryption: 'AES-256 encryption for all PHI'
    }
  },
  
  '164.312(b)': {
    requirement: 'Audit Controls',
    implementation: {
      logging: 'Log all access to PHI (who, what, when, where)',
      retention: 'Logs retained for 6 years (HIPAA requirement)',
      review: 'Daily automated review, weekly manual review'
    }
  },
  
  '164.312(c)': {
    requirement: 'Integrity',
    implementation: {
      mechanism: 'SHA-256 hashing, tamper detection',
      validation: 'Hash verification on every access'
    }
  },
  
  '164.312(d)': {
    requirement: 'Person or Entity Authentication',
    implementation: {
      mfa: 'Mandatory MFA for all PHI access',
      biometric: 'Optional fingerprint/face recognition'
    }
  },
  
  '164.312(e)': {
    requirement: 'Transmission Security',
    implementation: {
      encryption: 'TLS 1.3 for all PHI in transit',
      integrityControls: 'Message authentication codes (HMAC)'
    }
  }
};
```

#### Business Associate Agreement (BAA):

```
CryptGuard will provide a HIPAA-compliant BAA to customers including:
✅ Agree to safeguard PHI
✅ Report breaches within 60 days
✅ Ensure subcontractors sign BAAs
✅ Allow audits by covered entity
✅ Return/destroy PHI at contract end
```

---

### **4. GDPR (General Data Protection Regulation)**

**What:** EU privacy regulation  
**Who Needs It:** Anyone with EU customers  
**Timeline:** Ongoing compliance  
**Cost:** $20,000-100,000+ (varies by company size)  

#### GDPR Principles:

```javascript
const GDPR_COMPLIANCE = {
  // Article 5: Principles
  lawfulness: {
    requirement: 'Legal basis for processing (consent, contract, legitimate interest)',
    implementation: {
      consent: 'Explicit opt-in checkboxes (no pre-checked)',
      withdrawal: 'Easy consent withdrawal (one-click)',
      records: 'Record of consent (who, when, what)'
    }
  },
  
  // Article 6: Lawful Basis
  legalBasis: {
    cryptguard: 'Contract (providing file storage service)',
    marketing: 'Consent (opt-in for marketing emails)',
    security: 'Legitimate interest (fraud prevention)'
  },
  
  // Article 7: Conditions for Consent
  consent: {
    requirement: 'Freely given, specific, informed, unambiguous',
    implementation: {
      language: 'Plain language, no legalese',
      granular: 'Separate consent for different purposes',
      minors: 'Parental consent required if under 16'
    }
  },
  
  // Article 15-22: Data Subject Rights
  rights: {
    rightToAccess: {
      requirement: 'Provide copy of personal data within 30 days',
      implementation: 'Self-service data export (JSON format)'
    },
    
    rightToRectification: {
      requirement: 'Allow correction of inaccurate data',
      implementation: 'User profile settings, edit capability'
    },
    
    rightToErasure: {
      requirement: 'Delete data (right to be forgotten)',
      implementation: 'Account deletion feature, 30-day grace period'
    },
    
    rightToRestriction: {
      requirement: 'Restrict processing of data',
      implementation: 'Account suspension (data kept but not processed)'
    },
    
    rightToPortability: {
      requirement: 'Provide data in machine-readable format',
      implementation: 'Export to JSON/CSV/ZIP'
    },
    
    rightToObject: {
      requirement: 'Object to processing (e.g., marketing)',
      implementation: 'Unsubscribe links, preference center'
    }
  },
  
  // Article 25: Privacy by Design
  privacyByDesign: {
    dataMinimization: 'Only collect necessary data (email, name, files)',
    pseudonymization: 'Use UUIDs instead of names in logs',
    encryption: 'Encrypt all personal data at rest and in transit',
    defaultPrivacy: 'Most restrictive privacy settings by default'
  },
  
  // Article 32: Security of Processing
  security: {
    encryption: 'AES-256 (state of the art)',
    pseudonymization: 'Hash email addresses in analytics',
    testing: 'Regular security testing, penetration tests',
    restoration: 'Disaster recovery plan, tested quarterly'
  },
  
  // Article 33-34: Breach Notification
  breachNotification: {
    authority: 'Notify supervisory authority within 72 hours',
    individuals: 'Notify affected individuals without undue delay',
    records: 'Document all breaches (even if no notification required)'
  },
  
  // Article 35: Data Protection Impact Assessment (DPIA)
  dpia: {
    required: 'For high-risk processing (large-scale sensitive data)',
    cryptguard: 'Conducted DPIA for file storage system',
    review: 'Update DPIA annually or when major changes'
  },
  
  // Article 37: Data Protection Officer (DPO)
  dpo: {
    requirement: 'Appoint DPO if large-scale sensitive data processing',
    cryptguard: 'privacy@cryptguard.com',
    tasks: 'Monitor compliance, conduct training, handle requests'
  },
  
  // Article 44-49: International Transfers
  internationalTransfers: {
    adequacyDecision: 'EU-approved countries (UK, Switzerland, etc.)',
    standardContractualClauses: 'Use SCCs for transfers to US',
    dataLocalization: 'Option to keep data in EU-only regions'
  }
};

// Implementation: Data Export (Right to Access)
app.get('/api/user/export', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  // Gather all user data
  const userData = {
    profile: await db.query('SELECT * FROM users WHERE id = ?', [userId]),
    files: await db.query('SELECT * FROM files WHERE user_id = ?', [userId]),
    auditLogs: await db.query('SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC', [userId]),
    sessions: await db.query('SELECT * FROM sessions WHERE user_id = ?', [userId]),
    exportedAt: new Date().toISOString()
  };
  
  // Remove sensitive fields
  delete userData.profile.password_hash;
  delete userData.profile.mfa_secret;
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="cryptguard-data-export-${userId}.json"`);
  res.json(userData);
});

// Implementation: Account Deletion (Right to Erasure)
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  // 1. Soft delete (30-day grace period)
  await db.query(`
    UPDATE users 
    SET deleted_at = NOW(), deletion_scheduled = NOW() + INTERVAL 30 DAY
    WHERE id = ?
  `, [userId]);
  
  // 2. Send confirmation email
  await sendEmail({
    to: req.user.email,
    subject: 'Account Deletion Scheduled',
    body: `Your account will be permanently deleted in 30 days. To cancel, log in before ${new Date(Date.now() + 30*24*60*60*1000).toDateString()}.`
  });
  
  // 3. Schedule actual deletion (cron job handles)
  res.json({ message: 'Account deletion scheduled for 30 days from now' });
});

// Cron job: Permanent deletion after 30 days
cron.schedule('0 2 * * *', async () => {
  // Find accounts past grace period
  const toDelete = await db.query(`
    SELECT * FROM users 
    WHERE deletion_scheduled < NOW()
  `);
  
  for (const user of toDelete) {
    // 1. Delete files from storage
    await s3.deleteFolder(`users/${user.id}/`);
    
    // 2. Delete from database
    await db.query('DELETE FROM files WHERE user_id = ?', [user.id]);
    await db.query('DELETE FROM sessions WHERE user_id = ?', [user.id]);
    await db.query('DELETE FROM users WHERE id = ?', [user.id]);
    
    // 3. Anonymize audit logs (keep for legal but remove PII)
    await db.query(`
      UPDATE audit_logs 
      SET user_id = NULL, ip_address = 'REDACTED', user_agent = 'REDACTED'
      WHERE user_id = ?
    `, [user.id]);
    
    // 4. Log deletion
    logger.info(`GDPR: Permanently deleted user ${user.id}`);
  }
});
```

---

### **5. NIST Cybersecurity Framework**

**What:** US government cybersecurity framework  
**Who Needs It:** Government contractors, critical infrastructure  
**Timeline:** Ongoing  
**Cost:** Implementation-dependent  

#### Five Core Functions:

```javascript
const NIST_CSF = {
  // 1. IDENTIFY
  identify: {
    'ID.AM': 'Asset Management - Inventory all systems, data, devices',
    'ID.BE': 'Business Environment - Understand role, dependencies',
    'ID.GV': 'Governance - Security policies, procedures',
    'ID.RA': 'Risk Assessment - Annual risk assessments',
    'ID.RM': 'Risk Management Strategy - Risk appetite, mitigation'
  },
  
  // 2. PROTECT
  protect: {
    'PR.AC': 'Access Control - RBAC, MFA, least privilege',
    'PR.AT': 'Awareness Training - Annual security training',
    'PR.DS': 'Data Security - Encryption at rest/transit',
    'PR.IP': 'Information Protection - Backups, policies',
    'PR.MA': 'Maintenance - Patching, updates',
    'PR.PT': 'Protective Technology - Firewalls, AV, IDS/IPS'
  },
  
  // 3. DETECT
  detect: {
    'DE.AE': 'Anomalies - ML-based anomaly detection',
    'DE.CM': 'Continuous Monitoring - Real-time dashboards',
    'DE.DP': 'Detection Processes - Incident detection runbooks'
  },
  
  // 4. RESPOND
  respond: {
    'RS.RP': 'Response Planning - Incident response plan',
    'RS.CO': 'Communications - Stakeholder communication plan',
    'RS.AN': 'Analysis - Root cause analysis, post-mortems',
    'RS.MI': 'Mitigation - Containment procedures',
    'RS.IM': 'Improvements - Lessons learned implementation'
  },
  
  // 5. RECOVER
  recover: {
    'RC.RP': 'Recovery Planning - Disaster recovery plan',
    'RC.IM': 'Improvements - Update plans based on lessons',
    'RC.CO': 'Communications - Status updates during recovery'
  }
};
```

---

### **6. PCI DSS (Payment Card Industry Data Security Standard)**

**What:** Security standard for handling credit cards  
**Who Needs It:** If accepting credit card payments  
**Timeline:** 6-12 months  
**Cost:** $10,000-50,000+  

**Note:** CryptGuard doesn't store credit cards - we use Stripe (PCI compliant payment processor), so we're out of scope for most PCI requirements!

```javascript
const PCI_COMPLIANCE = {
  strategy: 'Use Stripe (SAQ A) - Redirect to Stripe-hosted checkout',
  
  requirements: {
    'SAQ_A': {
      description: 'E-commerce merchants who redirect to hosted payment page',
      requirements: 'Only 22 controls (vs 300+ for SAQ D)',
      cryptguardStatus: 'Compliant via Stripe'
    }
  },
  
  implementation: {
    payment: 'Stripe Checkout (hosted page)',
    storage: 'Never touch credit card data',
    transmission: 'Stripe handles all card data',
    security: 'Our normal security controls (TLS, etc.)'
  }
};
```

---

## 🎯 Compliance Roadmap

### **Phase 1: Foundation (Months 1-3)**
```
✅ Implement core security controls
  - Encryption (AES-256)
  - MFA (TOTP)
  - Audit logging
  - Access controls (RBAC)
  - Backups (3-2-1 rule)

✅ Document policies
  - Information Security Policy
  - Acceptable Use Policy
  - Incident Response Plan
  - Disaster Recovery Plan
  - Privacy Policy
```

### **Phase 2: SOC 2 Preparation (Months 4-9)**
```
🔄 Hire auditor (CPA firm)
🔄 Conduct readiness assessment
🔄 Remediate gaps
🔄 Begin 3-6 month observation period
🔄 Final audit
✅ Receive SOC 2 Type II report
```

### **Phase 3: HIPAA (Months 6-9)**
```
🔄 Conduct HIPAA gap analysis
🔄 Implement missing controls
🔄 Execute BAAs with subprocessors (AWS, etc.)
🔄 HIPAA training for all staff
✅ HIPAA compliant
```

### **Phase 4: ISO 27001 (Months 10-18)**
```
🔄 Gap assessment
🔄 Implement missing controls
🔄 ISMS documentation
🔄 Internal audit
🔄 Certification audit (Stage 1 & 2)
✅ ISO 27001 certified
```

---

## 💰 Compliance Cost Estimate

| Certification | Timeline | Audit Cost | Implementation Cost | Annual Maintenance | Total Year 1 |
|---------------|----------|------------|---------------------|-------------------|--------------|
| **SOC 2 Type II** | 6-12 months | $20k-50k | $30k-80k | $15k-30k | $65k-160k |
| **ISO 27001** | 12-18 months | $30k-80k | $50k-150k | $20k-40k | $100k-270k |
| **HIPAA** | 3-6 months | $5k-20k | $10k-40k | $5k-15k | $20k-75k |
| **GDPR** | Ongoing | N/A | $20k-60k | $10k-30k | $30k-90k |
| **ALL** | 18-24 months | $55k-150k | $110k-330k | $50k-115k | $215k-595k |

**Reality:** Most companies start with SOC 2 (required by enterprises), add HIPAA if healthcare customers, and get ISO 27001 for global expansion.

---

## 🎯 Final Recommendations for CryptGuard

### **Launch (v2.0 MVP)**
✅ Implement security controls  
✅ Document policies  
✅ Target: Small businesses (no compliance required)  

### **6 Months Post-Launch**
🎯 Start SOC 2 audit process  
🎯 Implement HIPAA if healthcare customers  
🎯 Target: Enterprise customers  

### **12 Months Post-Launch**
🎯 Achieve SOC 2 Type II  
🎯 Start ISO 27001 process  
🎯 Target: Global enterprises, government  

### **18-24 Months Post-Launch**
🎯 Achieve ISO 27001  
🎯 Explore FedRAMP (if government focus)  
🎯 Target: All enterprise segments  

---

**This phased approach balances speed-to-market with long-term compliance goals!**

Last Updated: November 10, 2025
