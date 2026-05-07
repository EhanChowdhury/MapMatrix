"use client";

import type { Job } from "../types";

interface Props {
  job: Job;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  apiBase: string;
  dimmed?: boolean;
}

function statusBadge(status: string) {
  const s = (status || "pending").toLowerCase();
  if (s === "running" || s === "active" || s === "in_progress") return "badge-running";
  if (s === "completed" || s === "done" || s === "finished") return "badge-done";
  if (s === "failed" || s === "error") return "badge-failed";
  return "badge-pending";
}

function statusDot(status: string) {
  const s = (status || "pending").toLowerCase();
  if (s === "running" || s === "active" || s === "in_progress") return "var(--accent)";
  if (s === "completed" || s === "done" || s === "finished") return "var(--emerald)";
  if (s === "failed" || s === "error") return "var(--rose)";
  return "var(--amber)";
}

function formatDate(dt: string) {
  try {
    return new Date(dt).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dt;
  }
}

export default function JobRow({ job, onDelete, onDownload, dimmed }: Props) {
  const cls = statusBadge(job.status);
  const dot = statusDot(job.status);
  const isRunning = ["running", "active", "in_progress"].includes((job.status || "pending").toLowerCase());
  const isDone = ["completed", "done", "finished"].includes((job.status || "pending").toLowerCase());

  return (
    <tr style={{ opacity: dimmed ? 0.4 : 1, transition: "opacity 0.2s" }}>
      {/* Name + ID */}
      <td>
        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
          {job.name}
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
          {job.id}
        </div>
      </td>

      {/* Keywords */}
      <td>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 220 }}>
          {(job.data?.keywords ?? []).slice(0, 3).map((kw, i) => (
            <span
              key={i}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontSize: 11,
                padding: "2px 7px",
                color: "var(--text-secondary)",
              }}
            >
              {kw}
            </span>
          ))}
          {(job.data?.keywords?.length ?? 0) > 3 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>
              +{(job.data?.keywords?.length ?? 0) - 3} more
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td>
        <span className={`badge ${cls}`}>
          <span
            className="pulse-dot"
            style={{ background: dot, animationPlayState: isRunning ? "running" : "paused" }}
          />
          {job.status || "Pending"}
        </span>
      </td>

      {/* Date */}
      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
        {formatDate(job.date)}
      </td>

      {/* Config */}
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {job.data?.lang && (
            <span style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-primary)", borderRadius: 4,
              fontSize: 10, fontWeight: 700, padding: "2px 6px"
            }}>
              {job.data.lang.toUpperCase()}
            </span>
          )}
          {job.data?.zoom != null && (
            <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }} title={`Zoom: ${job.data.zoom}`}>
              <span style={{ opacity: 0.6, fontSize: 11 }}>⌕</span> {job.data.zoom}
            </span>
          )}
          {job.data?.fast_mode && (
            <span style={{ fontSize: 12, color: "var(--amber)", cursor: "help" }} title="Fast Mode">⚡</span>
          )}
          {job.data?.email && (
            <span style={{ fontSize: 12, color: "var(--accent)", cursor: "help" }} title="Extracting Emails">✉</span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {isDone && (
            <button
              onClick={() => onDownload(job.id)}
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: "5px 10px" }}
              title="Download CSV"
            >
              ↓ CSV
            </button>
          )}
          <button
            onClick={() => onDelete(job.id)}
            className="btn btn-danger"
            style={{ fontSize: 12, padding: "5px 10px" }}
            title="Delete job"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
