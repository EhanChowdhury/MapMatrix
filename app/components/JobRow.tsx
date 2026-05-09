"use client";

import type { Job } from "../types";

interface Props {
  job: Job;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onView: (id: string) => void;
  apiBase: string;
  dimmed?: boolean;
}

function statusBadgeClass(status: string) {
  const s = (status || "pending").toLowerCase();
  if (s === "running" || s === "active" || s === "in_progress" || s === "working") return "badge-running";
  if (s === "completed" || s === "done" || s === "finished") return "badge-done";
  if (s === "failed" || s === "error") return "badge-failed";
  return "badge-pending";
}

function statusColor(status: string) {
  const s = (status || "pending").toLowerCase();
  if (s === "running" || s === "active" || s === "in_progress" || s === "working") return "var(--amber)";
  if (s === "completed" || s === "done" || s === "finished") return "var(--emerald)";
  if (s === "failed" || s === "error") return "var(--rose)";
  return "var(--amber)";
}

export default function JobRow({ job, onDelete, onDownload, onView, dimmed }: Props) {
  const badgeCls = statusBadgeClass(job.status);
  const color = statusColor(job.status);
  const isRunning = ["running", "active", "in_progress", "working"].includes((job.status || "pending").toLowerCase());
  const isDone = ["completed", "done", "finished"].includes((job.status || "pending").toLowerCase());

  return (
    <tr
      className={`group transition-colors duration-200 hover:bg-white/[0.02] ${dimmed ? "opacity-30 pointer-events-none" : ""}`}
    >
      {/* Job Name */}
      <td className="px-8 py-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
            {job.name}
          </span>
          <span className="text-[10px] font-mono text-slate-500/80 uppercase tracking-tighter">
            {job.id.split("-")[0]}...
          </span>
        </div>
      </td>

      {/* Keywords */}
      <td className="px-8 py-5">
        <div className="flex flex-wrap gap-1.5 max-w-[240px]">
          {job.data?.keywords?.slice(0, 3).map((k, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 whitespace-nowrap"
            >
              {k}
            </span>
          ))}
          {job.data?.keywords && job.data.keywords.length > 3 && (
            <span className="text-[10px] font-black text-slate-600 px-1">+{job.data.keywords.length - 3}</span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-8 py-5">
        <span className={`badge-status ${badgeCls}`}>
          <div className="relative">
            <span className="pulse-dot block" style={{ background: color, animationPlayState: isRunning ? "running" : "paused" }} />
            {isRunning && <span className="absolute inset-0 bg-current rounded-full animate-ping opacity-20" style={{ color }} />}
          </div>
          {job.status || "Pending"}
        </span>
      </td>

      {/* Timestamp */}
      <td className="px-8 py-5 text-xs font-medium text-slate-400">
        {new Date(job.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </td>

      {/* Config */}
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          {job.data?.lang && (
            <span className="text-[10px] font-black uppercase text-slate-400 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
              {job.data.lang}
            </span>
          )}
          {job.data?.zoom != null && (
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1" title={`Zoom: ${job.data.zoom}`}>
              <span className="opacity-30">⌕</span> {job.data.zoom}
            </span>
          )}
          <div className="flex items-center gap-2 ml-1">
            {job.data?.fast_mode && <span className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" title="Fast Mode Enabled">⚡</span>}
            {job.data?.email && <span className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" title="Email Extraction Enabled">✉</span>}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="px-8 py-5">
        <div className="flex items-center gap-2 transition-opacity duration-200">
          {isDone && (
            <>
              <button
                onClick={() => onView(job.id)}
                className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 shadow-lg shadow-blue-500/5"
                title="View Data"
              >
                <span className="text-sm">👁</span>
              </button>
              <button
                onClick={() => onDownload(job.id)}
                className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                title="Download CSV"
              >
                <span className="text-sm">↓</span>
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(job.id)}
            className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-lg shadow-rose-500/5"
            title="Delete Job"
          >
            <span className="text-sm">×</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
