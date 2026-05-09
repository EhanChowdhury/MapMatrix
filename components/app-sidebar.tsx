"use client"

import * as React from "react"
import {
  DashboardSquare01Icon,
  Task01Icon,
  Settings01Icon,
  PlusSignIcon,
  GlobalIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

type View = "dashboard" | "jobs" | "new-job" | "settings";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  view: View
  onViewChange: (v: View) => void
  jobCount: number
  isError?: boolean
  isLoading?: boolean
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
  { id: "jobs", label: "Jobs", icon: Task01Icon },
  { id: "settings", label: "Settings", icon: Settings01Icon },
] as const

export function AppSidebar({ view, onViewChange, jobCount, isError, isLoading, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-20 flex flex-col justify-center px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center border-b border-sidebar-border bg-sidebar-background transition-all">
        <div className="flex items-center gap-3 overflow-hidden group-data-[collapsible=icon]:justify-center">
          <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-600 text-white font-black shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0 text-lg">
            M
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-black text-xl tracking-tighter bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
              MapMatrix
            </span>
            <span className="text-[9px] text-sidebar-foreground/30 uppercase tracking-[0.3em] font-bold">
              by Sytax
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-0 pt-4 transition-all">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30 mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={view === item.id}
                    onClick={() => onViewChange(item.id as View)}
                    tooltip={item.label}
                    className="h-11 px-3 data-[active=true]:bg-primary/10 data-[active=true]:text-primary rounded-xl transition-all"
                  >
                    <HugeiconsIcon icon={item.icon} size={20} strokeWidth={2} className="shrink-0" />
                    <span className="font-semibold text-[13px] tracking-tight group-data-[collapsible=icon]:hidden">{item.label}</span>
                    {item.id === "jobs" && jobCount > 0 && (
                      <SidebarMenuBadge className="bg-primary/20 text-primary border border-primary/20 font-bold px-1.5 rounded-md ml-auto">
                        {jobCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onViewChange("new-job")}
                  className="h-11 bg-linear-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white hover:text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 rounded-xl"
                  tooltip="New Job"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2.5} className="shrink-0" />
                  <span className="font-bold text-[13px] group-data-[collapsible=icon]:hidden">New Job</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center border-t border-sidebar-border bg-sidebar-accent/5 transition-all">
        <div className="flex flex-col gap-3 group-data-[collapsible=icon]:items-center">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
            <span className="text-[10px] font-black text-sidebar-foreground/30 uppercase tracking-[0.2em]">
              System
            </span>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isError ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                isLoading ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                  "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              }`}>
              <span className={`size-1 rounded-full animate-pulse ${isError ? "bg-rose-500" :
                  isLoading ? "bg-amber-500" :
                    "bg-emerald-500"
                }`} />
              <span className="text-[9px] font-black uppercase tracking-tighter">
                {isError ? "Offline" : isLoading ? "Sync" : "Live"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sidebar-background border border-sidebar-border group-data-[collapsible=icon]:hidden shadow-sm">
            <HugeiconsIcon icon={GlobalIcon} size={14} className="text-primary/50" />
            <code className="text-[10px] font-mono text-sidebar-foreground/60 font-semibold truncate">
              RUNNING
            </code>
          </div>
          <div className="hidden group-data-[collapsible=icon]:block">
            <div className={`size-8 rounded-xl border flex items-center justify-center ${isError ? "bg-rose-500/10 border-rose-500/20" :
                isLoading ? "bg-amber-500/10 border-amber-500/20" :
                  "bg-emerald-500/10 border-emerald-500/20"
              }`}>
              <span className={`size-1.5 rounded-full ${isError ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                  isLoading ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                    "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                }`} title={isError ? "Offline" : isLoading ? "Syncing" : "API Live"} />
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
