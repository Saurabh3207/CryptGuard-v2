-- Test user data
INSERT INTO users (email, password_hash, first_name, last_name, email_verified)
VALUES 
    ('test@example.com', '$argon2id$v=19$m=65536,t=3,p=4$...(hash here)', 'Test', 'User', true),
    ('admin@example.com', '$argon2id$v=19$m=65536,t=3,p=4$...(hash here)', 'Admin', 'User', true);

-- Test file data
INSERT INTO files (user_id, file_name, file_size, file_hash, storage_key, encryption_metadata, mime_type)
SELECT 
    u.id,
    'test-document.pdf',
    1024000,
    'abc123def456...',
    'encrypted/user123/test-document.pdf.enc',
    '{"iv": "...", "authTag": "..."}',
    'application/pdf'
FROM users u
WHERE u.email = 'test@example.com';

-- Test session data
INSERT INTO sessions (user_id, token_hash, refresh_token_hash, device_fingerprint, ip_address, user_agent, expires_at)
SELECT 
    u.id,
    'token_hash_123',
    'refresh_hash_456',
    'device_abc',
    '127.0.0.1',
    'Mozilla/5.0...',
    NOW() + INTERVAL '7 days'
FROM users u
WHERE u.email = 'test@example.com';
