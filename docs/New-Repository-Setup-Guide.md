# CryptGuard v2.0 - New Repository Setup Guide

**Date:** November 10, 2025  
**Goal:** Create CryptGuard v2.0 repository and copy code from blockchain version

---

## 🎯 Step-by-Step Process

### **STEP 1: Create New GitHub Repository**

#### Option A: Via GitHub Website
1. Go to: https://github.com/new
2. **Repository name:** `CryptGuard-v2` (or just `CryptGuard` if you rename old one)
3. **Description:** "Secure cloud-native file vault with zero-knowledge encryption"
4. **Visibility:** Private (for now)
5. **Initialize:** 
   - ✅ Add README
   - ✅ Add .gitignore (Node)
   - ✅ Add license (MIT)
6. Click **"Create repository"**

#### Option B: Via GitHub CLI (if installed)
```bash
gh repo create CryptGuard-v2 --private --description "Secure cloud-native file vault with zero-knowledge encryption"
```

---

### **STEP 2: Clone New Repository Locally**

```bash
# Navigate to parent directory
cd D:\

# Clone new repository
git clone https://github.com/Saurabh3207/CryptGuard-v2.git

# Enter directory
cd CryptGuard-v2
```

---

### **STEP 3: Create Project Structure**

```bash
# Create main directories
mkdir client
mkdir server
mkdir docs

# Create subdirectories
cd server
mkdir config controllers db middleware models routes utils

cd ../client
mkdir public src

cd src
mkdir components pages contexts hooks utils assets constants routes

cd components
mkdir ui

# Go back to root
cd D:\CryptGuard-v2
```

**Resulting structure:**
```
CryptGuard-v2/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   └── ui/
│       ├── constants/
│       ├── contexts/
│       ├── hooks/
│       ├── pages/
│       ├── routes/
│       └── utils/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
└── docs/
```

---

### **STEP 4: Copy Core Encryption Code (Most Important!)**

**These are your competitive advantage - copy first!**

```powershell
# Copy server-side encryption utilities
Copy-Item "D:\CryptGuard\Server\utils\encryption.js" -Destination "D:\CryptGuard-v2\server\utils\"
Copy-Item "D:\CryptGuard\Server\utils\decryption.js" -Destination "D:\CryptGuard-v2\server\utils\"
Copy-Item "D:\CryptGuard\Server\utils\generateKey.js" -Destination "D:\CryptGuard-v2\server\utils\"

# Copy client-side encryption utilities
Copy-Item "D:\CryptGuard\Client\CryptGuard\src\utils\cryptoUtils.js" -Destination "D:\CryptGuard-v2\client\src\utils\"
```

---

### **STEP 5: Copy UI Components (Design System)**

```powershell
# Copy all UI components
Copy-Item "D:\CryptGuard\Client\CryptGuard\src\components\ui\*" -Destination "D:\CryptGuard-v2\client\src\components\ui\" -Recurse

# Copy styling
Copy-Item "D:\CryptGuard\Client\CryptGuard\src\App.css" -Destination "D:\CryptGuard-v2\client\src\"
Copy-Item "D:\CryptGuard\Client\CryptGuard\src\index.css" -Destination "D:\CryptGuard-v2\client\src\"

# Copy assets (logos, images)
Copy-Item "D:\CryptGuard\Client\CryptGuard\src\assets\*" -Destination "D:\CryptGuard-v2\client\src\assets\" -Recurse
```

---

### **STEP 6: Copy Reusable Server Utilities**

```powershell
# Copy general utilities
Copy-Item "D:\CryptGuard\Server\utils\logger.js" -Destination "D:\CryptGuard-v2\server\utils\"
Copy-Item "D:\CryptGuard\Server\utils\errorHandler.js" -Destination "D:\CryptGuard-v2\server\utils\"
Copy-Item "D:\CryptGuard\Server\utils\validation.js" -Destination "D:\CryptGuard-v2\server\utils\"

# Copy middleware (will need modification later)
Copy-Item "D:\CryptGuard\Server\middleware\multer.js" -Destination "D:\CryptGuard-v2\server\middleware\"
```

---

### **STEP 7: Copy Documentation**

```powershell
# Copy all planning documents
Copy-Item "D:\CryptGuard\docs\*" -Destination "D:\CryptGuard-v2\docs\" -Recurse

# Copy README concept (will modify later)
Copy-Item "D:\CryptGuard\README.md" -Destination "D:\CryptGuard-v2\README-old.md"
```

---

### **STEP 8: Initialize Package Files**

#### Server package.json

Create `D:\CryptGuard-v2\server\package.json`:

```json
{
  "name": "cryptguard-server-v2",
  "version": "2.0.0",
  "description": "CryptGuard v2.0 - Cloud-native secure file vault server",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "keywords": ["encryption", "secure", "storage", "zero-knowledge"],
  "author": "Saurabh3207",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1487.0",
    "winston": "^3.11.0",
    "joi": "^17.11.0",
    "express-rate-limit": "^7.1.5",
    "nodemailer": "^6.9.7",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  }
}
```

#### Client package.json

Create `D:\CryptGuard-v2\client\package.json`:

```json
{
  "name": "cryptguard-client-v2",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "daisyui": "^4.4.20",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
```

---

### **STEP 9: Create Environment Files**

#### Server .env.example

Create `D:\CryptGuard-v2\server\.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/cryptguard_v2
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cryptguard_v2
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Secrets
JWT_ACCESS_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cryptguard-files

# Email (for password reset, 2FA)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Encryption
MASTER_ENCRYPTION_KEY=generate_with_openssl_rand_hex_32
```

#### Client .env.example

Create `D:\CryptGuard-v2\client\.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=CryptGuard
VITE_APP_VERSION=2.0.0
```

---

### **STEP 10: Create .gitignore**

Create `D:\CryptGuard-v2\.gitignore`:

```
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Uploads (local development)
uploads/
temp/

# Tests
coverage/
.nyc_output/

# Logs
logs/
*.log
npm-debug.log*
```

---

### **STEP 11: Create Initial README**

Create `D:\CryptGuard-v2\README.md`:

```markdown
# CryptGuard v2.0

**Secure Cloud-Native File Vault with Zero-Knowledge Encryption**

---

## 🎯 What is CryptGuard v2.0?

CryptGuard is a secure file storage platform that provides:

- ✅ **Zero-Knowledge Encryption** - Only you can decrypt your files
- ✅ **Tamper Detection** - Cryptographic hashing ensures file integrity
- ✅ **Industry-Specific Features** - Built for law firms, healthcare, forensics
- ✅ **Privacy-First** - No data mining, no AI scanning
- ✅ **Compliance Ready** - HIPAA, GDPR, SOC 2 compatible

---

## 🏗️ Architecture

### v2.0 Stack (Cloud-Native)
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Storage:** AWS S3
- **Auth:** JWT + Email/Password + 2FA

### Why v2.0?
CryptGuard v1.0 used blockchain (Ethereum + IPFS), which created adoption barriers:
- Required crypto wallets
- Gas fees for uploads
- Limited to crypto-savvy users

v2.0 removes these barriers while maintaining **the same security benefits**:
- Same zero-knowledge encryption
- Same tamper detection (cryptographic hashing)
- Faster, cheaper, accessible to everyone

---

## 📦 Project Structure

```
CryptGuard-v2/
├── client/           # React frontend
├── server/           # Node.js backend
└── docs/             # Documentation & planning
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- AWS Account (for S3)

### Installation

```bash
# Clone repository
git clone https://github.com/Saurabh3207/CryptGuard-v2.git
cd CryptGuard-v2

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration

```bash
# Server
cd server
cp .env.example .env
# Edit .env with your credentials

# Client
cd ../client
cp .env.example .env
# Edit .env with API URL
```

### Run Development

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

---

## 📖 Documentation

See `docs/` folder for:
- Software Requirements Specification (SRS)
- Technical Architecture
- Product Roadmap
- Development Plan
- Code Migration Strategy

---

## 🔐 Security Features

1. **Client-Side Encryption** - Files encrypted before upload
2. **Zero-Knowledge Architecture** - Server cannot decrypt files
3. **Cryptographic Hashing** - SHA-256 for tamper detection
4. **2FA Authentication** - TOTP-based two-factor auth
5. **Audit Logging** - Track all file access

---

## 📊 Project Status

**Current Version:** 2.0.0-alpha  
**Status:** In Development  
**Target Release:** Q1 2026

### Completed
- ✅ Planning & architecture
- ✅ Code migration from v1.0
- ✅ Encryption utilities ported

### In Progress
- 🔄 Authentication system
- 🔄 PostgreSQL schema
- 🔄 AWS S3 integration

### Planned
- 📋 File sharing system
- 📋 Organization features
- 📋 Industry templates

---

## 🤝 Contributing

This is currently a private project. Contributions welcome after public release.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🔗 Links

- **v1.0 (Blockchain):** [CryptGuard-Blockchain](https://github.com/Saurabh3207/CryptGuard)
- **Live Demo:** Coming soon
- **Documentation:** See `/docs` folder

---

**Built with ❤️ by Saurabh**
```

---

### **STEP 12: Commit Initial Structure**

```bash
cd D:\CryptGuard-v2

# Add all files
git add .

# Commit
git commit -m "chore: initial project setup with code migrated from v1.0

- Added project structure (client/server/docs)
- Copied encryption utilities (core competitive advantage)
- Copied UI components and styling
- Added package.json for both client and server
- Created environment variable templates
- Added comprehensive README

Migrated ~60% of code from blockchain v1.0, keeping all encryption and UI while removing blockchain dependencies."

# Push to GitHub
git push origin main
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] New repository created on GitHub
- [ ] Cloned to `D:\CryptGuard-v2`
- [ ] Project structure created (client/server/docs)
- [ ] Encryption utilities copied
- [ ] UI components copied
- [ ] Server utilities copied
- [ ] package.json files created
- [ ] .env.example files created
- [ ] .gitignore created
- [ ] README.md created
- [ ] All files committed and pushed

---

## 🎯 Next Steps

After setup is complete:

1. **Install Dependencies:**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Set Up PostgreSQL:**
   - Install PostgreSQL
   - Create database: `cryptguard_v2`
   - Run schema migrations

3. **Configure AWS S3:**
   - Create S3 bucket
   - Get access credentials
   - Update .env file

4. **Start Development:**
   - Begin with Sprint 1: Authentication System
   - Follow Development-Plan-v2.0.md

---

## 📝 Notes

**Important:**
- Old repo (`D:\CryptGuard`) remains untouched
- All blockchain code preserved in v1.0.0-blockchain-final tag
- New repo (`D:\CryptGuard-v2`) is clean slate with reused code
- ~60% code reuse (encryption, UI, utilities)
- ~40% new code (auth, database, storage)

---

**Ready to proceed?** Follow these steps one by one, and you'll have CryptGuard v2.0 ready for development! 🚀

---

**Last Updated:** November 10, 2025  
**Status:** Ready to execute
