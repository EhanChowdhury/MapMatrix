"use client";

import { useState } from "react";
import type { Job } from "../types";
import JobRow from "./JobRow";
import CSVViewerModal from "./CSVViewerModal";

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
type Filter = "all" | "running" | "done" | "failed";

export default function JobsTable({ jobs: jobsProp, loading, error, apiBase, onRefresh, onJobsChange, onNewJob }: Props) {
  const jobs = jobsProp ?? [];
  const [sort, setSort] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingJob, setViewingJob] = useState<{ id: string, name: string } | null>(null);

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
      const s = (j.status || "pending").toLowerCase();
      // Global filter: Remove pending jobs from the table entirely
      if (s === "pending" || s === "queued") return false;

      if (filter !== "all") {
        if (filter === "running" && !["running", "active", "in_progress", "working"].includes(s)) return false;
        if (filter === "done" && !["completed", "done", "finished"].includes(s)) return false;
        if (filter === "failed" && !["failed", "error"].includes(s)) return false;
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
    { key: "running", label: "Working" },
    { key: "done", label: "Done" },
    { key: "failed", label: "Failed" },
  ];

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(col)}
      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${sort === col ? "text-primary" : "text-slate-500 hover:text-slate-300"}`}
    >
      {label}
      <span className="text-[9px] opacity-40">{sort === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
    </button>
  );

  return (
    <>
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[280px]">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">⌕</span>
          <input
            className="input w-full pl-12"
            placeholder="Search operations, keywords, IDs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all ${filter === f.key ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-300"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onRefresh} className="btn-premium border border-white/5 hover:bg-white/5 text-slate-300 px-4">
             <span className="text-base leading-none">↻</span>
          </button>
          <button onClick={onNewJob} className="btn-premium btn-premium-primary">+ New Job</button>
        </div>
      </div>

      {/* Table card */}
      <div className="card-glass overflow-hidden bg-card/40 backdrop-blur-3xl">
        {loading ? (
          <div className="p-10 flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="shimmer h-14 w-full rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="p-20 text-center flex flex-col items-center gap-6">
            <div className="size-16 rounded-3xl bg-rose-500/10 flex items-center justify-center text-3xl text-rose-500">⚠</div>
            <div>
              <div className="text-xl font-black mb-1">Connection Interrupted</div>
              <p className="text-slate-500 text-sm max-w-sm">{error}</p>
            </div>
            <button onClick={onRefresh} className="btn-premium btn-premium-primary">Retry Connection</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-24 text-center flex flex-col items-center gap-6">
            <div className="size-20 rounded-3xl bg-slate-800/30 flex items-center justify-center text-4xl text-slate-600">◈</div>
            <div>
              <div className="text-xl font-black mb-1">No Results Found</div>
              <p className="text-slate-500 text-sm max-w-sm">
                {jobs.length === 0 ? "You haven't launched any scraping jobs yet." : "Try adjusting your filters or search terms."}
              </p>
            </div>
            {jobs.length === 0 && (
              <button onClick={onNewJob} className="btn-premium btn-premium-primary">+ Launch First Job</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-8 py-5 border-b border-white/5"><SortBtn col="name" label="Job Name" /></th>
                  <th className="px-8 py-5 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Keywords</th>
                  <th className="px-8 py-5 border-b border-white/5"><SortBtn col="status" label="Status" /></th>
                  <th className="px-8 py-5 border-b border-white/5"><SortBtn col="date" label="Timestamp" /></th>
                  <th className="px-8 py-5 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Config</th>
                  <th className="px-8 py-5 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                    onView={(id) => setViewingJob({ id, name: job.name })}
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
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 text-right px-4">
          Manifesting {filtered.length} / {jobs.length} operations · Synced every 8s
        </div>
      )}
    </div>
      {viewingJob && (
        <CSVViewerModal
          jobId={viewingJob.id}
          jobName={viewingJob.name}
          apiBase={apiBase}
          onClose={() => setViewingJob(null)}
        />
      )}
    </>
  );
}
