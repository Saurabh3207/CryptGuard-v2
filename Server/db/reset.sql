-- Drop all tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_expired_sessions();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS prevent_audit_log_changes();

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";
