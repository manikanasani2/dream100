/*
  # Add message status columns

  1. New Columns
    - `dm_1_status` (text, default 'draft') - Status of first direct message
    - `dm_2_status` (text, default 'draft') - Status of second direct message  
    - `dm_3_status` (text, default 'draft') - Status of third direct message

  2. Changes
    - Remove `dm_1sent` boolean column as functionality replaced by `dm_1_status`
    - Add check constraints to ensure valid status values

  3. Data Migration
    - Migrate existing `dm_1sent` boolean values to `dm_1_status`
*/

-- Add new status columns
ALTER TABLE dream_leads 
ADD COLUMN IF NOT EXISTS dm_1_status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS dm_2_status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS dm_3_status text DEFAULT 'draft';

-- Migrate existing dm_1sent boolean data to dm_1_status
DO $$
BEGIN
  UPDATE dream_leads 
  SET dm_1_status = CASE 
    WHEN dm_1sent = true THEN 'sent'
    ELSE 'draft'
  END
  WHERE dm_1sent IS NOT NULL;
END $$;

-- Add check constraints for valid status values
ALTER TABLE dream_leads 
ADD CONSTRAINT IF NOT EXISTS chk_dm_1_status 
CHECK (dm_1_status IN ('draft', 'sent', 'scheduled', 'failed'));

ALTER TABLE dream_leads 
ADD CONSTRAINT IF NOT EXISTS chk_dm_2_status 
CHECK (dm_2_status IN ('draft', 'sent', 'scheduled', 'failed'));

ALTER TABLE dream_leads 
ADD CONSTRAINT IF NOT EXISTS chk_dm_3_status 
CHECK (dm_3_status IN ('draft', 'sent', 'scheduled', 'failed'));

-- Remove the old dm_1sent column (commented out for safety - uncomment when ready)
-- ALTER TABLE dream_leads DROP COLUMN IF EXISTS dm_1sent;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dream_leads_dm_1_status ON dream_leads(dm_1_status);
CREATE INDEX IF NOT EXISTS idx_dream_leads_dm_2_status ON dream_leads(dm_2_status);
CREATE INDEX IF NOT EXISTS idx_dream_leads_dm_3_status ON dream_leads(dm_3_status);