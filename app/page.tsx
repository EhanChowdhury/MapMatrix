"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardView from "./components/DashboardView";
import JobsTable from "./components/JobsTable";
import SettingsView from "./components/SettingsView";
import NewJobModal from "./components/NewJobModal";
import type { Job } from "./types";

type View = "dashboard" | "jobs" | "settings";

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [showNewJob, setShowNewJob] = useState(false);
  const apiBase = ""; // Always use the Next.js proxy
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/jobs`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rawJobs = Array.isArray(data) ? data : [];
      const mappedJobs = rawJobs.map((j: any) => ({
        id: j.id || j.ID,
        name: j.name || j.Name,
        date: j.date || j.Date,
        status: (j.status || j.Status || "pending").toLowerCase() === "ok" ? "completed" : (j.status || j.Status || "pending"),
        data: j.data || j.Data || {}
      }));
      setJobs(mappedJobs);
      setJobsError(null);
    } catch (e: unknown) {
      setJobsError(e instanceof Error ? e.message : "Failed to load jobs");
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    setJobsLoading(true);
    loadJobs();
    pollRef.current = setInterval(loadJobs, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadJobs]);

  function handleViewChange(v: View) {
    setView(v);
  }

  function pageTitle() {
    if (view === "dashboard") return "Overview";
    if (view === "jobs") return "Jobs";
    if (view === "settings") return "Settings";
    return "";
  }

  return (
    <>
      <AppSidebar
        view={view as any}
        onViewChange={(v) => {
          if (v === "new-job") setShowNewJob(true);
          else handleViewChange(v as View);
        }}
        jobCount={jobs?.length ?? 0}
        isError={!!jobsError}
        isLoading={jobsLoading}
      />

      <SidebarInset className="flex flex-col overflow-hidden bg-background">
        {/* Top bar */}
        <header className="h-20 flex items-center px-10 border-b border-white/[0.03] bg-background/80 backdrop-blur-2xl shrink-0 gap-8 sticky top-0 z-20">
          <SidebarTrigger className="-ml-3 size-10 rounded-xl hover:bg-white/5 transition-all text-slate-400" />

          <div className="flex-1 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">
                Matrix
              </span>
              <span className="size-1 rounded-full bg-slate-700" />
              <span className="text-base font-black text-foreground tracking-tight">{pageTitle()}</span>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border shadow-sm transition-colors ${
              jobsError ? "bg-rose-500/5 border-rose-500/10 text-rose-500" : 
              jobsLoading ? "bg-amber-500/5 border-amber-500/10 text-amber-500" : 
              "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
            }`}>
              <div className="relative">
                <span className={`size-1.5 rounded-full block ${
                  jobsError ? "bg-rose-500" : 
                  jobsLoading ? "bg-amber-500" : 
                  "bg-emerald-500"
                }`} />
                {!jobsError && (
                  <span className={`absolute inset-0 size-1.5 rounded-full animate-ping opacity-40 ${
                    jobsLoading ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] current-color">
                {jobsLoading ? "Syncing…" : jobsError ? "Offline" : "System Live"}
              </span>
            </div>



          </div>

        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-auto p-8 lg:p-12">
          {view === "dashboard" && (
            <DashboardView
              jobs={jobs}
              loading={jobsLoading}
              onNewJob={() => setShowNewJob(true)}
            />
          )}

          {view === "jobs" && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Scrape Jobs</h1>
                <p className="text-sm text-muted-foreground">
                  Create, monitor, and download all your Google Maps scraping tasks
                </p>
              </div>
              <JobsTable
                jobs={jobs}
                loading={jobsLoading}
                error={jobsError}
                apiBase={apiBase}
                onRefresh={loadJobs}
                onJobsChange={setJobs}
                onNewJob={() => setShowNewJob(true)}
              />
            </div>
          )}

          {view === "settings" && (
            <SettingsView />
          )}
        </main>
      </SidebarInset>

      {showNewJob && (
        <NewJobModal
          apiBase={apiBase}
          onJobCreated={(job) => {
            setJobs((prev) => [job, ...(Array.isArray(prev) ? prev : [])]);
            setView("jobs");
          }}
          onClose={() => setShowNewJob(false)}
        />
      )}
    </>
  );
}
