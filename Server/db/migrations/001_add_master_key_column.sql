-- Add missing master_key_encrypted column to users table
ALTER TABLE users ADD COLUMN master_key_encrypted TEXT;
