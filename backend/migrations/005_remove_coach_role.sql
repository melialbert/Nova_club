-- Remove COACH role from UserRole enum
-- This migration removes the COACH role option, keeping only ADMIN and SECRETARY

-- First, update any existing COACH users to SECRETARY
UPDATE users SET role = 'SECRETARY' WHERE role = 'COACH';

-- Drop the role column
ALTER TABLE users DROP COLUMN IF EXISTS role CASCADE;

-- Drop the old enum type
DROP TYPE IF EXISTS userrole CASCADE;

-- Create the enum with only ADMIN and SECRETARY
CREATE TYPE userrole AS ENUM ('ADMIN', 'SECRETARY');

-- Add the role column back with the updated enum type
ALTER TABLE users ADD COLUMN role userrole DEFAULT 'SECRETARY'::userrole NOT NULL;
