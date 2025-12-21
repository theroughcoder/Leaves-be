-- Migration: Add manager_id field to users table
-- Date: 2025-12-21

-- Add manager_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='manager_id'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add role column if it doesn't exist (in case the schema wasn't updated)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='role'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'employee';
    END IF;
END $$;

-- Create index on manager_id for faster lookups if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename='users' AND indexname='idx_users_manager_id'
    ) THEN
        CREATE INDEX idx_users_manager_id ON users(manager_id);
    END IF;
END $$;

-- Migration completed successfully

