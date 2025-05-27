import { AlertCircle, User, Clock, CheckCircle2 } from "lucide-react"

export const JOB_STATUS_CONFIG = {
  open: { 
    label: "Open", 
    variant: "default" as const, 
    icon: AlertCircle 
  },
  accepted: { 
    label: "Accepted", 
    variant: "default" as const, 
    icon: User 
  },
  onsite: { 
    label: "On Site", 
    variant: "success" as const, 
    icon: Clock 
  },
  completed: { 
    label: "Completed", 
    variant: "outline" as const, 
    icon: CheckCircle2 
  }
} as const

export type JobStatus = keyof typeof JOB_STATUS_CONFIG 