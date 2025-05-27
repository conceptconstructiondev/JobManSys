import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (using snake_case to match PostgreSQL conventions)
export interface Job {
  id: string
  title: string
  description: string
  company: string
  status: 'open' | 'accepted' | 'onsite' | 'completed'
  accepted_by: string | null
  accepted_at: string | null
  onsite_time: string | null
  completed_time: string | null
  invoiced: boolean
  created_at: string
  updated_at?: string
  work_started_image?: string
  work_started_notes?: string
  work_completed_image?: string
  work_completed_notes?: string
} 