# Database Setup Reference

## PostgreSQL Commands

### Initial Setup (One-time)
```bash
# Create database
psql -U postgres -c "CREATE DATABASE cryptguard;"

# Run schema migration
cd D:\CryptGuard-v2\Server
psql -U postgres -d cryptguard -f db/schema.sql

# (Optional) Seed test data
psql -U postgres -d cryptguard -f db/seed.sql
```

### Connect to Database
```bash
# Connect to cryptguard database
psql -U postgres -d cryptguard

# Run queries from file
psql -U postgres -d cryptguard -f db/queries.sql
```

### Reset Database (Development only)
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE cryptguard;"
psql -U postgres -c "CREATE DATABASE cryptguard;"
psql -U postgres -d cryptguard -f db/schema.sql

# Or use reset script
psql -U postgres -d cryptguard -f db/reset.sql
psql -U postgres -d cryptguard -f db/schema.sql
```

### Backup & Restore
```bash
# Backup to file
pg_dump -U postgres cryptguard > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres -d cryptguard < backup_20250111.sql
```

## Database Files

- **schema.sql** - Create tables, indexes, triggers
- **queries.sql** - Useful SELECT queries for debugging
- **seed.sql** - Test data (development only)
- **reset.sql** - Drop all tables (WARNING: deletes data!)

## Environment Variables

⚠️ **Special Characters in Password:**
If your PostgreSQL password contains special characters like `@`, `#`, `%`, use URL encoding:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

Example:
```env
# Password: kali@123
DATABASE_URL=postgresql://postgres:kali%40123@localhost:5432/cryptguard
```

## Connection Test

```bash
cd D:\CryptGuard-v2\Server
node test-db.js
```

Should output:
```
✅ Database connected successfully!
Server time: 2025-11-11...
PostgreSQL version: PostgreSQL 18.0...

📋 Tables created:
  - audit_logs
  - devices
  - files
  - sessions
  - users
```

