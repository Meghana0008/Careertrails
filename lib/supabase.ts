import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ===== TypeScript types for all tables =====

export interface Profile {
    id: string
    name: string
    email: string
    role: 'user' | 'team'
    branch: string
    cgpa: string
    placement_status: 'Placed' | 'Unplaced'
    created_at: string
}

export interface Job {
    id: number
    title: string
    company: string
    location: string
    salary: string
    type: string
    category: 'On-Campus' | 'Off-Campus'
    description: string
    requirements: string[]
    responsibilities: string[]
    posted_by: string | null
    created_at: string
}

export interface Application {
    id: number
    user_id: string
    job_id: number
    status: 'Under Review' | 'Interview Scheduled' | 'Accepted' | 'Rejected'
    rejection_reason?: string
    applied_at: string
    // Joined fields
    jobs?: Job
}

export interface Company {
    id: number
    name: string
    industry: string
    contact: string
    website: string
    status: 'Active' | 'Pending' | 'Inactive'
    created_at: string
}

export interface Drive {
    id: number
    company: string
    role: string
    drive_date: string
    drive_time: string
    venue: string
    eligible: string
    description: string
    package: string
    created_at: string
}

export interface Offer {
    id: number
    user_id: string
    company: string
    role: string
    salary: string
    offer_date: string
    status: 'Pending' | 'Accepted' | 'Declined'
    created_at: string
}

export interface InterviewExperience {
    id: number
    user_id: string
    company: string
    role: string
    type: 'On-Campus' | 'Off-Campus'
    rounds: string
    experience: string
    result: 'Selected' | 'Rejected' | 'Pending'
    tips: string
    created_at: string
    // Joined fields
    profiles?: { name: string }
}
