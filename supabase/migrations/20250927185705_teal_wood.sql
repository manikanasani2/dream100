/*
  # Create dream_leads table

  1. New Tables
    - `dream_leads`
      - `process_id` (text, primary key) - Unique identifier for each lead process
      - `lead_name` (text, required) - Name of the lead person
      - `lead_company_name` (text, optional) - Company name of the lead
      - `lead_linkedin_url` (text, required) - LinkedIn profile URL of the lead
      - `lead_company_linkedin_url` (text, optional) - Company LinkedIn URL
      - `company_website` (text, optional) - Company website URL
      - `potential_services` (text, optional) - Services that could be offered
      - `lead_email` (text, optional) - Email address of the lead
      - `lead_phone_number` (text, optional) - Phone number of the lead
      - `connection_request_message` (text, optional) - Message sent with connection request
      - `company_website_data` (jsonb, optional) - Scraped website data
      - `company_linkedin_data` (jsonb, optional) - LinkedIn company data
      - `lead_status` (text, optional) - Current status of the lead
      - `connection_accepted_status` (boolean, optional) - Whether connection was accepted
      - `dm_1` (text, optional) - First direct message content
      - `dm_2` (text, optional) - Second direct message content
      - `dm_3` (text, optional) - Third direct message content
      - `dm1_timestamp` (timestamptz, optional) - Timestamp of first DM
      - `booked_meeting` (boolean, optional) - Whether a meeting was booked
      - `industry` (text, optional) - Industry of the lead's company
      - `job_title` (text, optional) - Job title of the lead
      - `dm_1sent` (boolean, optional) - Whether first DM was sent
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on `dream_leads` table
    - Add policy for public access (since no authentication is implemented)
*/

CREATE TABLE IF NOT EXISTS dream_leads (
  process_id text PRIMARY KEY,
  lead_name text NOT NULL,
  lead_company_name text,
  lead_linkedin_url text NOT NULL,
  lead_company_linkedin_url text,
  company_website text,
  potential_services text,
  lead_email text,
  lead_phone_number text,
  connection_request_message text,
  company_website_data jsonb,
  company_linkedin_data jsonb,
  lead_status text,
  connection_accepted_status boolean,
  dm_1 text,
  dm_2 text,
  dm_3 text,
  dm1_timestamp timestamptz,
  booked_meeting boolean DEFAULT false,
  industry text,
  job_title text,
  dm_1sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE dream_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust based on your authentication needs)
CREATE POLICY "Allow public access to dream_leads"
  ON dream_leads
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dream_leads_updated_at
  BEFORE UPDATE ON dream_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();