-- Migration to add guest_trip column to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS guest_trip JSONB DEFAULT NULL;
