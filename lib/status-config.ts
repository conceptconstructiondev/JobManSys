import { AlertCircle, User, Clock, CheckCircle2 } from "lucide-react"

export const JOB_STATUS_CONFIG = {
  open: { 
    label: "Open", 
    variant: "open" as const, 
    icon: AlertCircle 
  },
  accepted: { 
    label: "Accepted", 
    variant: "accepted" as const, 
    icon: User 
  },
  onsite: { 
    label: "On Site", 
    variant: "onsite" as const, 
    icon: Clock 
  },
  completed: { 
    label: "Completed", 
    variant: "completed" as const, 
    icon: CheckCircle2 
  }
} as const

export type JobStatus = keyof typeof JOB_STATUS_CONFIG 