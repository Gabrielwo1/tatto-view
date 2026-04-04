-- Migration to add preferred_contact_method and hidden_from_hero to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'whatsapp';
ALTER TABLE artists ADD COLUMN IF NOT EXISTS hidden_from_hero BOOLEAN DEFAULT false;
