"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ExternalLink, CheckCircle2, X } from "lucide-react"
import Link from "next/link"
import { JOB_STATUS_CONFIG } from "@/lib/status-config"
import { UserCache } from "@/lib/userCache"

// Job type definition
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

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "id",
    header: "Job ID",
    cell: ({ row }) => {
      const fullId = row.getValue("id") as string
      // Show first 8 characters of the ID
      const truncatedId = fullId.substring(0, 8)
      return (
        <div className="font-medium text-blue-600" title={fullId}>
          {truncatedId}...
      </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Date Created",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at")
      
      // Handle different date formats
      let date: Date
      if (typeof dateValue === 'string') {
        date = new Date(dateValue)
      } else if (dateValue instanceof Date) {
        date = dateValue
      } else {
        // Fallback to current date if invalid
        date = new Date()
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return <div className="text-sm text-red-500">Invalid Date</div>
      }
      
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      
      return (
        <div className="text-sm">
          {formattedDate}
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate" title={row.getValue("title")}>
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate" title={row.getValue("description")}>
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const config = JOB_STATUS_CONFIG[status as keyof typeof JOB_STATUS_CONFIG]
      
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    accessorKey: "accepted_by",
    header: "Accepted By",
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const acceptedBy = row.getValue("accepted_by")
      
      if (!acceptedBy) {
        return <span className="text-sm text-muted-foreground">-</span>
      }

      const acceptedByStr = acceptedBy as string
      
      // Check if it's a UUID (user ID)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acceptedByStr)
      
      if (isUUID) {
        const email = UserCache.getUserEmail(acceptedByStr)
        const name = UserCache.getUserName(acceptedByStr)
        
        if (email) {
          // Prefer name if available, otherwise use email
          const displayText = name || email
          const truncated = displayText.length > 15 ? displayText.substring(0, 15) + "..." : displayText
          
          return (
            <span className="text-sm" title={`${name || ''} (${email})`}>
              {truncated}
            </span>
          )
        } else {
          // Unknown user - show truncated ID and log it
          const truncated = acceptedByStr.substring(0, 8) + "..."
          return (
            <span className="text-sm text-orange-600" title={`Unknown user: ${acceptedByStr}`}>
              {truncated} ❓
            </span>
          )
        }
      } else {
        // It's already an email
        const truncated = acceptedByStr.length > 15 ? acceptedByStr.substring(0, 15) + "..." : acceptedByStr
        return (
          <span className="text-sm" title={acceptedByStr}>
            {truncated}
          </span>
        )
      }
    },
  },
  {
    accessorKey: "time_spent",
    header: "Time Spent",
    cell: ({ row }) => {
      const timeSpent = row.getValue("time_spent")
      if (!timeSpent || typeof timeSpent !== 'string') {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      
      return (
        <span className="text-sm font-mono">
          {timeSpent}
        </span>
      )
    },
  },
  {
    accessorKey: "onsite_time",
    header: "Onsite Time",
    cell: ({ row }) => {
      const onsiteTime = row.getValue("onsite_time")
      if (!onsiteTime) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      
      const date = new Date(onsiteTime as string)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return <span className="text-sm text-red-500">Invalid Date</span>
      }
      
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      const formattedTime = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })
      
      return (
        <span className="text-sm">
          {formattedDate} {formattedTime}
        </span>
      )
    },
  },
  {
    accessorKey: "completed_time",
    header: "Completed Time",
    cell: ({ row }) => {
      const completedTime = row.getValue("completed_time")
      if (!completedTime) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      
      const date = new Date(completedTime as string)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return <span className="text-sm text-red-500">Invalid Date</span>
      }
      
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      const formattedTime = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })
      
      return (
        <span className="text-sm">
          {formattedDate} {formattedTime}
        </span>
      )
    },
  },
  {
    accessorKey: "invoiced",
    header: "Invoiced",
    cell: ({ row }) => {
      const invoiced = row.getValue("invoiced")
      return (
        <div className="flex items-center">
          {invoiced ? (
            <span title="Invoiced">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </span>
          ) : (
            <span title="Not invoiced">
              <X className="h-4 w-4 text-red-500" />
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const job = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(job.id)}>
              Copy job ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/jobs/${job.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
              Edit job
            </DropdownMenuItem> */}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem>
              {job.invoiced ? "Mark as not invoiced" : "Mark as invoiced"}
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 