-- Migration: Add competitions and member career tracking
--
-- This migration adds tables for tracking member careers including:
-- 1. Competitions table - stores competition information
-- 2. Member competitions table - tracks member participation and results
-- 3. Career events table - tracks other career milestones (certifications, achievements, etc.)

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    competition_type VARCHAR(100),
    location VARCHAR(255),
    competition_date DATE NOT NULL,
    description TEXT,
    level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create member_competitions table (tracks participation and results)
CREATE TABLE IF NOT EXISTS member_competitions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    rank_achieved INTEGER,
    weight_category VARCHAR(50),
    medal VARCHAR(20),
    points_earned INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, competition_id)
);

-- Create career_events table (other career milestones)
CREATE TABLE IF NOT EXISTS career_events (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    achievement_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_competitions_club_id ON competitions(club_id);
CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(competition_date);
CREATE INDEX IF NOT EXISTS idx_member_competitions_member_id ON member_competitions(member_id);
CREATE INDEX IF NOT EXISTS idx_member_competitions_competition_id ON member_competitions(competition_id);
CREATE INDEX IF NOT EXISTS idx_career_events_member_id ON career_events(member_id);
CREATE INDEX IF NOT EXISTS idx_career_events_date ON career_events(event_date);
