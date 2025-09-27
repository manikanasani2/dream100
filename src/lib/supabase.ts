import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export type Lead = {
  process_id: string;
  lead_name: string;
  lead_company_name: string | null;
  lead_linkedin_url: string;
  lead_company_linkedin_url: string | null;
  company_website: string | null;
  potential_services: string | null;
  lead_email: string | null;
  lead_phone_number: string | null;
  connection_request_message: string | null;
  company_website_data: any;
  company_linkedin_data: any;
  lead_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  connection_accepted_status: boolean | null;
  connection_accepted_status: boolean | null;
  dm_1: string | null;
  dm_2: string | null;
  dm_3: string | null;
  dm1_timestamp: string | null;
  booked_meeting: boolean | null;
  industry: string | null;
  job_title: string | null;
  dm_1sent: boolean | null;
};