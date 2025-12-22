-- Migration: Create leave table
-- Date: 2025-12-21

CREATE TABLE IF NOT EXISTS leaves (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- e.g., pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaves_user_id ON leaves(user_id);
CREATE INDEX IF NOT EXISTS idx_leaves_manager_id ON leaves(manager_id);

-- Auto-update updated_at on row update
CREATE OR REPLACE FUNCTION update_leave_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leaves_updated_at 
    BEFORE UPDATE ON leaves 
    FOR EACH ROW 
    EXECUTE FUNCTION update_leave_updated_at_column();

