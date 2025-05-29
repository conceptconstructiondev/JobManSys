export type Job = {
  id: string
  title: string
  description: string
  company: string
  status: "open" | "accepted" | "onsite" | "completed"
  accepted_by: string | null
  accepted_at?: string | null
  onsite_time: string | null
  completed_time: string | null
  time_spent: string | null 
  invoiced: boolean
  created_at: string
  updated_at?: string
  work_started_image?: string
  work_started_notes?: string
  work_completed_image?: string
  work_completed_notes?: string
}

// Mock data for jobs - you can replace this with real data from your database
export const jobsData: Job[] = [
  {
    id: "JOB001",
    title: "HVAC System Maintenance",
    description: "Quarterly maintenance check for HVAC systems in commercial building. This includes inspection of all units, filter replacement, and performance testing.",
    company: "Tech Corp",
    status: "open",
    accepted_by: null,
    accepted_at: undefined,
    onsite_time: null,
    completed_time: null,
    invoiced: false,
    created_at: "2024-01-15",
  },
  {
    id: "JOB002", 
    title: "Electrical Panel Inspection",
    description: "Safety inspection and testing of electrical panels in main office building. Must comply with local safety codes.",
    company: "Design Studio",
    status: "accepted",
    accepted_by: "John Smith",
    accepted_at: "2024-01-20T10:00:00Z",
    onsite_time: null,
    completed_time: null,
    invoiced: false,
    created_at: "2024-01-20",
  },
  {
    id: "JOB003",
    title: "Plumbing System Repair",
    description: "Fix leaking pipes and replace damaged fixtures in basement mechanical room. Multiple issues reported.",
    company: "Startup Inc",
    status: "onsite",
    accepted_by: "Mike Johnson", 
    accepted_at: "2024-01-25T09:00:00Z",
    onsite_time: "2024-01-25T09:00:00Z",
    completed_time: null,
    invoiced: false,
    created_at: "2024-01-10",
    work_started_image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
    work_started_notes: "Arrived on site and assessed the damage. Multiple pipe joints need replacement. Water has been shut off and area secured. Beginning repair work now.",
  },
  {
    id: "JOB004",
    title: "Fire Safety Inspection",
    description: "Annual fire safety compliance inspection for all systems including alarms, sprinklers, and emergency exits.",
    company: "Corporate Plaza",
    status: "completed",
    accepted_by: "Sarah Wilson",
    accepted_at: "2024-01-22T10:00:00Z",
    onsite_time: "2024-01-22T10:00:00Z",
    completed_time: "2024-01-22T15:30:00Z",
    invoiced: true,
    created_at: "2024-01-08",
    work_started_image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    work_started_notes: "Beginning comprehensive fire safety inspection. Starting with alarm systems on floors 1-3, then moving to sprinkler systems.",
    work_completed_image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    work_completed_notes: "All fire safety systems have been thoroughly inspected and tested. All alarms, sprinklers, and emergency exits are functioning properly and meet current safety codes. Compliance certificate has been issued.",
  },
]

// Helper function to get a job by ID
export function getJobById(id: string): Job | undefined {
  return jobsData.find(job => job.id === id)
} 