# 🚀 CryptGuard v2.0 - Quick Start (Zero Budget)

**Time to Complete:** 2-3 hours  
**Cost:** $0.00  
**Result:** Production-ready infrastructure with military-grade security  

---

## ✅ Pre-requisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] GitHub account (free)
- [ ] Valid email address (for service signups)
- [ ] Credit card (for verification only, won't be charged!)

---

## 📝 Step-by-Step Setup

### **Step 1: Create GitHub Repository (5 minutes)**

```powershell
# 1. Create new repo on GitHub.com
# - Name: CryptGuard-v2
# - Description: Cloud-native secure file storage (v2.0)
# - Public (free unlimited) or Private (free for personal)
# - Don't initialize with README (we'll push existing code)

# 2. Clone the new empty repo
cd D:\
git clone https://github.com/YOUR_USERNAME/CryptGuard-v2.git
cd CryptGuard-v2

# 3. Copy code from old repo (preserving only reusable parts)
# We'll do this in Step 10 after infrastructure is ready
```

---

### **Step 2: Sign Up for Vercel (Frontend Hosting) - 5 minutes**

```powershell
# 1. Go to: https://vercel.com/signup
# - Click "Continue with GitHub"
# - Authorize Vercel

# 2. Install Vercel CLI
npm install -g vercel

# 3. Login
vercel login
# Enter email → Check email for verification link → Click link

# 4. Get project IDs (we'll use these later)
# Go to: https://vercel.com/account
# - Org ID: Found in account settings
# - Project ID: We'll get this after first deployment

✅ Done! You have frontend hosting.
```

---

### **Step 3: Sign Up for Render.com (Backend Hosting) - 5 minutes**

```powershell
# 1. Go to: https://render.com/
# - Click "Get Started for Free"
# - Continue with GitHub
# - Authorize Render

# 2. We'll connect the repo later (after we push code)

✅ Done! You have backend hosting.
```

---

### **Step 4: Sign Up for Supabase (Database) - 10 minutes**

```powershell
# 1. Go to: https://supabase.com/
# - Click "Start your project"
# - Continue with GitHub
# - Authorize Supabase

# 2. Create new project:
# - Name: cryptguard-db
# - Database Password: (click "Generate a password" and SAVE IT!)
# - Region: Choose closest to you (e.g., US East, EU Central)
# - Plan: FREE (default)
# - Click "Create new project" (takes 2-3 minutes)

# 3. Get connection string:
# - Click "Project Settings" (gear icon)
# - Database → Connection string → URI
# - Copy the connection string (looks like):
#   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

# 4. Save to .env file (we'll create this later):
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

✅ Done! You have PostgreSQL database (500MB free).
```

---

### **Step 5: Sign Up for Cloudflare R2 (File Storage) - 10 minutes**

```powershell
# 1. Go to: https://dash.cloudflare.com/sign-up
# - Enter email + password
# - Verify email

# 2. Enable R2:
# - Left sidebar → R2 Object Storage
# - Click "Purchase R2 Plan"
# - Select "FREE" plan (no credit card required for free tier!)

# 3. Create bucket:
# - Click "Create bucket"
# - Name: cryptguard-files
# - Location: Automatic (Cloudflare picks best)
# - Click "Create bucket"

# 4. Create API token:
# - R2 → Manage R2 API Tokens
# - Click "Create API Token"
# - Token name: cryptguard-api
# - Permissions: Object Read & Write
# - TTL: Forever
# - Click "Create API Token"
# - SAVE: Access Key ID + Secret Access Key

# 5. Get Account ID:
# - Right side → Account ID (copy it)

# 6. Save to .env:
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=cryptguard-files

✅ Done! You have 10GB free file storage.
```

---

### **Step 6: Sign Up for Upstash (Redis) - 5 minutes**

```powershell
# 1. Go to: https://upstash.com/
# - Click "Get Started"
# - Continue with GitHub
# - Authorize Upstash

# 2. Create Redis database:
# - Click "Create Database"
# - Name: cryptguard-cache
# - Type: Regional (FREE)
# - Region: Choose closest to you
# - Click "Create"

# 3. Get connection string:
# - Click your database → "Redis Connect"
# - Copy the connection string (looks like):
#   rediss://default:[password]@[host]:6379

# 4. Save to .env:
REDIS_URL=rediss://default:[password]@[host]:6379

✅ Done! You have Redis cache (10k commands/day free).
```

---

### **Step 7: Sign Up for Resend (Email) - 5 minutes**

```powershell
# 1. Go to: https://resend.com/signup
# - Enter email + password
# - Verify email

# 2. Create API key:
# - Dashboard → API Keys
# - Click "Create API Key"
# - Name: cryptguard-api
# - Permission: Sending access
# - Click "Create"
# - SAVE the API key (starts with re_...)

# 3. Save to .env:
RESEND_API_KEY=re_your_api_key_here

# 4. (Optional) Add domain:
# - Domains → Add Domain
# - Enter your domain (e.g., cryptguard.com)
# - Add DNS records (if you have a domain)
# - Or use: "onboarding@resend.dev" for testing (free)

✅ Done! You can send 3,000 emails/month free.
```

---

### **Step 8: Sign Up for Grafana Cloud (Monitoring) - 5 minutes**

```powershell
# 1. Go to: https://grafana.com/auth/sign-up/create-user
# - Enter email + password
# - Verify email

# 2. Create stack:
# - Click "Create a stack"
# - Stack name: cryptguard-monitoring
# - Region: Choose closest
# - Plan: FREE (default)
# - Click "Create stack"

# 3. Get credentials:
# - Stack → Data sources → Prometheus
# - Copy: URL, Username, Password

# 4. Save to .env:
GRAFANA_PROMETHEUS_URL=https://prometheus-xxx.grafana.net/api/prom/push
GRAFANA_PROMETHEUS_USER=xxx
GRAFANA_PROMETHEUS_PASSWORD=xxx

✅ Done! You have monitoring dashboards free.
```

---

### **Step 9: Create .env File (5 minutes)**

```powershell
# 1. Navigate to your project
cd D:\CryptGuard-v2\Server

# 2. Create .env file
cat > .env << 'EOF'
# Node environment
NODE_ENV=development
PORT=5000

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=cryptguard-files

# Cache (Upstash Redis)
REDIS_URL=rediss://default:[password]@[host]:6379

# Email (Resend)
RESEND_API_KEY=re_your_api_key

# JWT (generate random secret)
JWT_SECRET=your_super_secret_jwt_key_here_generate_random_64_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_generate_random_64_chars

# Monitoring (Grafana Cloud)
GRAFANA_PROMETHEUS_URL=https://prometheus-xxx.grafana.net/api/prom/push
GRAFANA_PROMETHEUS_USER=xxx
GRAFANA_PROMETHEUS_PASSWORD=xxx

# Frontend URL (update after Vercel deployment)
CORS_ORIGIN=http://localhost:5173

EOF

# 3. Generate JWT secrets (secure random strings)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Copy the output and update .env file

# 4. NEVER commit .env to git!
echo ".env" >> .gitignore

✅ Done! Your secrets are configured.
```

---

### **Step 10: Set Up Database Schema (10 minutes)**

```powershell
# 1. Install PostgreSQL client
npm install pg

# 2. Create database schema file
cat > Server/db/schema.sql << 'EOF'
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  mfa_backup_codes TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  encryption_metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_hash ON files(file_hash);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) UNIQUE NOT NULL,
  refresh_token_hash VARCHAR(64) UNIQUE,
  device_fingerprint VARCHAR(64),
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

-- Audit logs table (immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  previous_log_hash VARCHAR(64),
  current_log_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Prevent modification/deletion (immutable logs)
CREATE OR REPLACE FUNCTION prevent_audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_audit_log_update ON audit_logs;
CREATE TRIGGER prevent_audit_log_update
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_changes();

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_name VARCHAR(255),
  device_fingerprint VARCHAR(64) UNIQUE NOT NULL,
  trusted BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_fingerprint ON devices(device_fingerprint);
EOF

# 3. Run migrations
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const schema = fs.readFileSync('db/schema.sql', 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating schema:', err);
    process.exit(1);
  }
})();
"

✅ Done! Your database is ready.
```

---

### **Step 11: Deploy to Vercel (Frontend) - 10 minutes**

```powershell
# 1. Navigate to frontend
cd D:\CryptGuard-v2\Client\CryptGuard

# 2. Create vercel.json config
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://cryptguard-api.onrender.com"
  }
}
EOF

# 3. Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Your account
# - Link to existing project? N
# - What's your project's name? cryptguard-v2
# - In which directory is your code? ./
# - Want to override settings? N

# 4. Deploy to production
vercel --prod

# ✅ Your frontend is live at: https://cryptguard-v2.vercel.app

# 5. Save the URL
echo "VITE_API_URL=https://cryptguard-api.onrender.com" >> .env.production

✅ Done! Frontend is deployed.
```

---

### **Step 12: Deploy to Render (Backend) - 10 minutes**

```powershell
# 1. Create render.yaml
cd D:\CryptGuard-v2\Server
cat > render.yaml << 'EOF'
services:
  - type: web
    name: cryptguard-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        sync: false
      - key: R2_ACCOUNT_ID
        sync: false
      - key: R2_ACCESS_KEY_ID
        sync: false
      - key: R2_SECRET_ACCESS_KEY
        sync: false
      - key: R2_BUCKET_NAME
        value: cryptguard-files
      - key: REDIS_URL
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: JWT_REFRESH_SECRET
        sync: false
      - key: CORS_ORIGIN
        value: https://cryptguard-v2.vercel.app
EOF

# 2. Push to GitHub
cd D:\CryptGuard-v2
git add .
git commit -m "Initial v2.0 setup with zero-budget infrastructure"
git push origin main

# 3. Connect to Render:
# - Go to: https://dashboard.render.com/
# - Click "New +" → "Web Service"
# - Connect your GitHub repo (CryptGuard-v2)
# - Render auto-detects render.yaml
# - Click "Create Web Service"

# 4. Add environment variables:
# - Dashboard → cryptguard-api → Environment
# - Add each secret from your .env file
# - Click "Save Changes"

# ✅ Your backend is live at: https://cryptguard-api.onrender.com

✅ Done! Backend is deployed.
```

---

### **Step 13: Set Up Keep-Alive (Prevent Cold Starts) - 5 minutes**

```powershell
# 1. Go to: https://cron-job.org/en/signup.php
# - Create free account

# 2. Create cron job:
# - Dashboard → "Create cronjob"
# - Title: CryptGuard Keep-Alive
# - Address: https://cryptguard-api.onrender.com/health
# - Schedule: Every 10 minutes
# - Save

# 3. Add health endpoint to your API:
# Server/index.js
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

# Commit and push:
git add Server/index.js
git commit -m "Add health check endpoint"
git push

✅ Done! Your API never sleeps.
```

---

### **Step 14: Set Up GitHub Actions (CI/CD) - 10 minutes**

```powershell
# 1. Create workflow file
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy CryptGuard v2.0

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies (Backend)
        run: cd Server && npm install
      
      - name: Run tests (Backend)
        run: cd Server && npm test

      - name: Install dependencies (Frontend)
        run: cd Client/CryptGuard && npm install
      
      - name: Run tests (Frontend)
        run: cd Client/CryptGuard && npm test

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: Client/CryptGuard

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
EOF

# 2. Add secrets to GitHub:
# - Go to: https://github.com/YOUR_USERNAME/CryptGuard-v2/settings/secrets/actions
# - Click "New repository secret"
# - Add:
#   - VERCEL_TOKEN (from Vercel → Account → Tokens)
#   - VERCEL_ORG_ID (from Vercel → Account Settings)
#   - VERCEL_PROJECT_ID (from Vercel → Project Settings)
#   - RENDER_DEPLOY_HOOK (from Render → Settings → Deploy Hook)

# 3. Commit and push
git add .github/workflows/deploy.yml
git commit -m "Add CI/CD pipeline"
git push

✅ Done! Auto-deploy on every push.
```

---

## 🎉 You're Done!

### **What You Have Now:**
- ✅ Frontend: https://cryptguard-v2.vercel.app
- ✅ Backend: https://cryptguard-api.onrender.com
- ✅ Database: Supabase PostgreSQL (500MB)
- ✅ Storage: Cloudflare R2 (10GB)
- ✅ Cache: Upstash Redis (10k commands/day)
- ✅ Email: Resend (3,000 emails/month)
- ✅ Monitoring: Grafana Cloud
- ✅ CI/CD: GitHub Actions (auto-deploy)
- ✅ SSL: Let's Encrypt (automatic)
- ✅ Cost: **$0.00/month** 🎉

---

## 🧪 Test Your Setup

```powershell
# 1. Health check
curl https://cryptguard-api.onrender.com/health

# Expected: {"status":"ok","timestamp":"2025-11-10T..."}

# 2. Database connection
curl https://cryptguard-api.onrender.com/api/health/database

# Expected: {"status":"ok","database":"connected"}

# 3. Storage connection
curl https://cryptguard-api.onrender.com/api/health/storage

# Expected: {"status":"ok","storage":"connected"}

# 4. Frontend
# Open: https://cryptguard-v2.vercel.app
# Expected: CryptGuard landing page loads
```

---

## 🐛 Troubleshooting

### **Backend not responding (504 timeout)?**
```
Cause: Cold start (Render spins down after 15 min)
Solution: Wait 30 seconds, try again. Set up cron-job.org keep-alive.
```

### **Database connection error?**
```
Cause: Wrong connection string or IP not whitelisted
Solution: 
1. Check DATABASE_URL in Render environment variables
2. Supabase → Settings → Database → Connection pooling (use port 6543, not 5432)
```

### **CORS error on frontend?**
```
Cause: CORS_ORIGIN not set correctly
Solution: 
1. Render → Environment → CORS_ORIGIN = https://cryptguard-v2.vercel.app
2. Restart service
```

### **File upload fails?**
```
Cause: R2 credentials wrong or bucket doesn't exist
Solution:
1. Check R2_* variables in Render
2. Cloudflare → R2 → Verify bucket name
3. Check API token has "Object Read & Write" permission
```

---

## 🚀 Next Steps

1. **Start coding!** Follow Development-Plan-v2.0.md (Sprint 1: Authentication)
2. **Test locally** before pushing to production
3. **Monitor** usage (stay within free tiers)
4. **Scale** when you hit limits (upgrade to paid plans)

---

**Congratulations! You have production infrastructure for $0! 🎉**

Last Updated: November 10, 2025
