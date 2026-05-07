"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
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
  const [apiBase, setApiBase] = useState("");
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
  }, [apiBase]);

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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        view={view}
        onViewChange={(v) => {
          if (v === "new-job") setShowNewJob(true);
          else handleViewChange(v as View);
        }}
        jobCount={jobs?.length ?? 0}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <header
          style={{
            height: 60, flexShrink: 0,
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center",
            padding: "0 28px",
            background: "var(--bg-card)",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
              MapMatrix
            </span>
            <span style={{ color: "var(--border-bright)", margin: "0 8px" }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{pageTitle()}</span>
          </div>

          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <span
              className="pulse-dot"
              style={{ background: jobsError ? "var(--rose)" : "var(--emerald)" }}
            />
            <span>{jobsLoading ? "Connecting…" : jobsError ? "Offline" : "API Live"}</span>
          </div>

          <div
            style={{
              padding: "4px 12px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: 11, color: "var(--text-muted)",
            }}
          >
            <span className="mono">{apiBase || "→ localhost:3000 (proxy)"}</span>
          </div>
        </header>

        {/* Scrollable content area */}
        <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {view === "dashboard" && (
            <DashboardView
              jobs={jobs}
              loading={jobsLoading}
              onNewJob={() => setShowNewJob(true)}
            />
          )}

          {view === "jobs" && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Scrape Jobs</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
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
            <SettingsView
              apiBase={apiBase}
              onApiBaseChange={setApiBase}
            />
          )}
        </main>
      </div>

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
    </div>
  );
}
