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
import { MoreHorizontal, ExternalLink, X, CheckCircle2 } from "lucide-react"
import Link from "next/link"

// Job type definition
export type Job = {
  id: string
  title: string
  description: string
  company: string
  status: "open" | "accepted" | "onsite" | "completed"
  acceptedBy: string | null
  onsiteTime: string | null
  completedTime: string | null
  invoiced: boolean
  createdAt: string
  workStartedImage?: string
  workStartedNotes?: string
  workCompletedImage?: string
  workCompletedNotes?: string
}

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "id",
    header: "Job ID",
    cell: ({ row }) => (
      <Link 
        href={`/dashboard/jobs/${row.getValue("id")}`}
        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
      >
        {row.getValue("id")}
      </Link>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      // Use a consistent format to avoid hydration mismatch
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
      <div className="font-medium">{row.getValue("title")}</div>
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
      
      const statusConfig = {
        open: { label: "Open", variant: "secondary" as const },
        accepted: { label: "Accepted", variant: "default" as const },
        onsite: { label: "Onsite", variant: "destructive" as const },
        completed: { label: "Completed", variant: "outline" as const },
      }
      
      const config = statusConfig[status as keyof typeof statusConfig]
      
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    accessorKey: "acceptedBy",
    header: "Accepted By",
    cell: ({ row }) => {
      const acceptedBy = row.getValue("acceptedBy")
      return acceptedBy ? (
        <span className="text-sm">{acceptedBy as string}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "onsiteTime",
    header: "Onsite Time",
    cell: ({ row }) => {
      const onsiteTime = row.getValue("onsiteTime")
      if (!onsiteTime) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      
      const date = new Date(onsiteTime as string)
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
    accessorKey: "completedTime",
    header: "Completed Time",
    cell: ({ row }) => {
      const completedTime = row.getValue("completedTime")
      if (!completedTime) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      
      const date = new Date(completedTime as string)
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
            <DropdownMenuItem>
              Edit job
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {job.invoiced ? "Mark as not invoiced" : "Mark as invoiced"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 