import { z } from 'zod';

export const leadSchema = z.object({
  lead_name: z.string().min(2, 'Name must be at least 2 characters'),
  lead_company_name: z.string().optional(),
  lead_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  lead_phone_number: z.string().optional(),
  job_title: z.string().optional(),
  industry: z.string().optional(),
  lead_linkedin_url: z.string().url('LinkedIn URL is required and must be valid'),
  lead_company_linkedin_url: z.string().url('Invalid company LinkedIn URL').optional().or(z.literal('')),
  company_website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  potential_services: z.string().optional(),
  connection_request_message: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;