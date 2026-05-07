"use client";

import { useState } from "react";
import type { Job } from "../types";
import JobRow from "./JobRow";

interface Props {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  apiBase: string;
  onRefresh: () => void;
  onJobsChange: (jobs: Job[]) => void;
  onNewJob: () => void;
}

type SortKey = "date" | "name" | "status";
type Filter = "all" | "running" | "done" | "failed" | "pending";

export default function JobsTable({ jobs: jobsProp, loading, error, apiBase, onRefresh, onJobsChange, onNewJob }: Props) {
  const jobs = jobsProp ?? [];
  const [sort, setSort] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`${apiBase}/api/v1/jobs/${id}`, { method: "DELETE" });
      onJobsChange(jobs.filter((j) => j.id !== id));
    } catch {
      alert("Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleDownload(id: string) {
    window.open(`${apiBase}/api/v1/jobs/${id}/download`, "_blank");
  }

  function handleSort(key: SortKey) {
    if (sort === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(key); setSortDir("desc"); }
  }

  const filtered = jobs
    .filter((j) => {
      if (filter !== "all") {
        const s = (j.status || "pending").toLowerCase();
        if (filter === "running" && !["running", "active", "in_progress"].includes(s)) return false;
        if (filter === "done" && !["completed", "done", "finished"].includes(s)) return false;
        if (filter === "failed" && !["failed", "error"].includes(s)) return false;
        if (filter === "pending" && !["pending", "queued"].includes(s)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          j.name.toLowerCase().includes(q) ||
          j.id.toLowerCase().includes(q) ||
          (j.data?.keywords ?? []).some((k) => k.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sort === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sort === "name") cmp = a.name.localeCompare(b.name);
      else if (sort === "status") cmp = (a.status || "pending").localeCompare(b.status || "pending");
      return sortDir === "asc" ? cmp : -cmp;
    });

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "running", label: "Running" },
    { key: "done", label: "Done" },
    { key: "failed", label: "Failed" },
    { key: "pending", label: "Pending" },
  ];

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(col)}
      style={{
        background: "none", border: "none", cursor: "pointer", display: "inline-flex",
        alignItems: "center", gap: 4, color: sort === col ? "var(--accent)" : "var(--text-muted)",
        fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
        fontFamily: "inherit",
      }}
    >
      {label}
      <span style={{ fontSize: 9 }}>{sort === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
    </button>
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 15, pointerEvents: "none" }}>
            ⌕
          </span>
          <input
            className="input"
            placeholder="Search jobs, keywords, IDs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                border: "1px solid",
                borderColor: filter === f.key ? "var(--accent)" : "var(--border)",
                background: filter === f.key ? "var(--accent-muted)" : "transparent",
                color: filter === f.key ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button onClick={onRefresh} className="btn btn-ghost" style={{ fontSize: 13 }}>↻ Refresh</button>
        <button onClick={onNewJob} className="btn btn-primary">+ New Job</button>
      </div>

      {/* Table card */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 52, width: "100%" }} />)}
          </div>
        ) : error ? (
          <div style={{ padding: "40px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠</div>
            <div style={{ color: "var(--rose)", fontWeight: 600, marginBottom: 4 }}>Connection Error</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{error}</div>
            <button onClick={onRefresh} className="btn btn-primary" style={{ marginTop: 16 }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.4 }}>◈</div>
            <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              {jobs.length === 0 ? "No jobs yet" : "No jobs match your filter"}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {jobs.length === 0 ? "Create your first scraping job to get started" : "Try adjusting your search or filter"}
            </div>
            {jobs.length === 0 && (
              <button onClick={onNewJob} className="btn btn-primary" style={{ marginTop: 16 }}>
                + Create First Job
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th><SortBtn col="name" label="Job" /></th>
                  <th>Keywords</th>
                  <th><SortBtn col="status" label="Status" /></th>
                  <th><SortBtn col="date" label="Created" /></th>
                  <th>Config</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                    apiBase={apiBase}
                    dimmed={deletingId === job.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>
          Showing {filtered.length} of {jobs.length} jobs · Auto-refresh every 8s
        </div>
      )}
    </div>
  );
}
