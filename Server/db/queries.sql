-- Connect to database
\c cryptguard

-- List all databases
\l

-- List all tables in current database
\dt

-- Describe table structures
\d users
\d files
\d sessions
\d audit_logs
\d devices

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'files', COUNT(*) FROM files
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'devices', COUNT(*) FROM devices;

-- View recent audit logs
SELECT 
    al.action, 
    al.resource_type, 
    al.created_at,
    u.email as user_email
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 10;

-- View active sessions
SELECT 
    u.email,
    s.ip_address,
    s.user_agent,
    s.created_at,
    s.expires_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW()
ORDER BY s.created_at DESC;

-- Clean expired sessions
SELECT cleanup_expired_sessions();
