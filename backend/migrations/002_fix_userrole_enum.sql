-- Fix UserRole enum values
-- This migration fixes the userrole enum to match the application code

-- Drop the role column if it exists
ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS role CASCADE;

-- Drop the old enum type if it exists
DROP TYPE IF EXISTS userrole CASCADE;

-- Create the enum with correct values (UPPERCASE to match Python enum)
CREATE TYPE userrole AS ENUM ('ADMIN', 'SECRETARY', 'COACH');

-- Add the role column back with the correct enum type
ALTER TABLE users ADD COLUMN role userrole DEFAULT 'SECRETARY'::userrole NOT NULL;
