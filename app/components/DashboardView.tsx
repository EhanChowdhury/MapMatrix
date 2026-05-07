"use client";

import type { Job } from "../types";

interface Props {
  jobs: Job[];
  loading: boolean;
  onNewJob: () => void;
}

function StatCard({
  label, value, sub, color, icon,
}: {
  label: string; value: string | number; sub?: string; color: string; icon: string;
}) {
  return (
    <div
      className="card card-glow"
      style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: 16 }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${color}1a`,
          border: `1px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ width: 3, height: 40, borderRadius: 99, background: color, opacity: 0.7 }} />
    </div>
  );
}

function RecentJobRow({ job }: { job: Job }) {
  const s = (job.status || "pending").toLowerCase();
  const color =
    ["running", "active", "in_progress"].includes(s) ? "var(--accent)" :
      ["completed", "done", "finished"].includes(s) ? "var(--emerald)" :
        ["failed", "error"].includes(s) ? "var(--rose)" : "var(--amber)";
  const isRunning = ["running", "active", "in_progress"].includes(s);

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 0",
        borderBottom: "1px solid rgba(99,120,180,0.08)",
      }}
    >
      <span className="pulse-dot" style={{ background: color, animationPlayState: isRunning ? "running" : "paused", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {job.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
          {job.data?.keywords?.slice(0, 2).join(", ")}
        </div>
      </div>
      <div style={{ fontSize: 12, color, fontWeight: 500, flexShrink: 0 }}>
        {job.status || "Pending"}
      </div>
    </div>
  );
}

export default function DashboardView({ jobs: jobsProp, loading, onNewJob }: Props) {
  const jobs = jobsProp ?? [];
  const total = jobs.length;
  const running = jobs.filter((j) => ["running", "active", "in_progress"].includes((j.status || "pending").toLowerCase())).length;
  const done = jobs.filter((j) => ["completed", "done", "finished"].includes((j.status || "pending").toLowerCase())).length;
  const failed = jobs.filter((j) => ["failed", "error"].includes((j.status || "pending").toLowerCase())).length;

  const recent = [...jobs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Hero */}
      <div
        className="card"
        style={{
          padding: "36px 40px",
          background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)",
          border: "1px solid rgba(59,130,246,0.2)",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Decorative orb */}
        <div style={{
          position: "absolute", right: -40, top: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 80, bottom: -60,
          width: 150, height: 150, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}
              >
                ⬡
              </div>
              <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                MapMatrix Dashboard
              </span>
            </div>
            <h1
              style={{
                fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px",
                background: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                lineHeight: 1.1, marginBottom: 10,
              }}
            >
              Google Maps Scraper<br />for NIBIZ SOFT
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 420, lineHeight: 1.6 }}>
              Manage scraping jobs, monitor progress, and extract business data from Google Maps — all in one dashboard.
            </p>
          </div>
          <button onClick={onNewJob} className="btn btn-primary" style={{ fontSize: 15, padding: "12px 24px" }}>
            + Launch New Job
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard label="Total Jobs" value={loading ? "…" : total} color="#60a5fa" icon="◈" />
        <StatCard label="Running" value={loading ? "…" : running} sub="currently active" color="#3b82f6" icon="⟳" />
        <StatCard label="Completed" value={loading ? "…" : done} sub="ready to download" color="#10b981" icon="✓" />
        <StatCard label="Failed" value={loading ? "…" : failed} sub="need attention" color="#f43f5e" icon="✕" />
      </div>

      {/* Recent Jobs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent list */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Jobs</h2>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{recent.length} shown</span>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 44, width: "100%" }} />)}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No jobs yet — create your first one above
            </div>
          ) : (
            <div>
              {recent.map((job) => <RecentJobRow key={job.id} job={job} />)}
            </div>
          )}
        </div>

        {/* Quick guide */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Quick Start</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { num: "01", title: "Create a Job", desc: "Enter keywords, language, and geo settings to start scraping Maps.", color: "var(--accent)" },
              { num: "02", title: "Monitor Progress", desc: "Jobs auto-refresh every 8s. Running jobs show a live pulse indicator.", color: "var(--violet)" },
              { num: "03", title: "Download Results", desc: "Once complete, download your data as a CSV with a single click.", color: "var(--emerald)" },
            ].map((step) => (
              <div key={step.num} style={{ display: "flex", gap: 14 }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: `${step.color}1a`, border: `1px solid ${step.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: step.color, fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* API endpoint */}
          <div
            style={{
              marginTop: 20, padding: "12px 14px",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
              API Base
            </div>
            <code className="mono" style={{ fontSize: 12, color: "var(--accent)" }}>
              http://localhost:8080/api/v1
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
