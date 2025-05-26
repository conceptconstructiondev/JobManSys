import { PlusIcon, BriefcaseIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Menu items for job management
const jobMenuItems = [
  {
    title: "All Jobs",
    url: "/dashboard",
    icon: BriefcaseIcon,
  },
  {
    title: "Add Job",
    url: "/dashboard/add-job",
    icon: PlusIcon,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <BriefcaseIcon className="h-6 w-6" />
          <span className="font-semibold text-sidebar-foreground">Job Tracker</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Job Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {jobMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-sidebar-foreground/60">
          © 2024 Job Tracker
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 