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
    <div className="stat-card group">
      <div
        className="size-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `${color}15`,
          border: `1px solid ${color}30`,
          color: color,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-3xl font-black tracking-tighter text-foreground leading-none mb-1">
          {value}
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
          {label}
        </div>
        {sub && (
          <div className="text-[10px] text-muted-foreground/40 mt-1 truncate">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function RecentJobRow({ job }: { job: Job }) {
  const s = (job.status || "pending").toLowerCase();
  const color =
    ["running", "active", "in_progress", "working"].includes(s) ? "var(--amber)" :
      ["completed", "done", "finished"].includes(s) ? "var(--emerald)" :
        ["failed", "error"].includes(s) ? "var(--rose)" : "var(--amber)";
  const isRunning = ["running", "active", "in_progress", "working"].includes(s);

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-white/[0.03] last:border-0 group transition-colors">
      <div className="relative shrink-0">
        <span className="pulse-dot block" style={{ background: color, animationPlayState: isRunning ? "running" : "paused" }} />
        {isRunning && <span className="absolute inset-0 bg-current rounded-full animate-ping opacity-20" style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
          {job.name}
        </div>
        <div className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
          {job.data?.keywords?.slice(0, 2).join(", ") || "No keywords"}
        </div>
      </div>
      <div
        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border"
        style={{ color, borderColor: `${color}20`, background: `${color}08` }}
      >
        {job.status || "Pending"}
      </div>
    </div>
  );
}

export default function DashboardView({ jobs: jobsProp, loading, onNewJob }: Props) {
  const jobs = jobsProp ?? [];
  const total = jobs.length;
  const running = jobs.filter((j) => ["running", "active", "in_progress", "working"].includes((j.status || "pending").toLowerCase())).length;
  const done = jobs.filter((j) => ["completed", "done", "finished"].includes((j.status || "pending").toLowerCase())).length;
  const failed = jobs.filter((j) => ["failed", "error"].includes((j.status || "pending").toLowerCase())).length;

  const recent = [...jobs]
    .filter((j) => !["pending", "queued"].includes((j.status || "pending").toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative p-10 lg:p-14 card-glass overflow-hidden border-blue-500/10 group">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-linear-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 size-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                ⬡
              </div>
              <span className="text-[10px] font-black  tracking-[0.3em] text-blue-400">
                MapEngine v1.0
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tightest leading-[1.05] mb-6">
              Scrape Leads <br />
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Fast & Reliably
              </span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed font-medium">
              Extract high-fidelity business data at scale. MapMatrix especially designed for NIBIZSOFT is the easiest and most
              efficient way to scrape Google Maps.
            </p>
          </div>
          <button
            onClick={onNewJob}
            className="btn-premium btn-premium-primary text-base px-8 py-4 self-start lg:self-center"
          >
            Start Scraping
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Operations" value={loading ? "…" : total} color="#3b82f6" icon="◈" />
        <StatCard label="Active Now" value={loading ? "…" : running} sub="Processing live" color="#f59e0b" icon="⟳" />
        <StatCard label="Successful" value={loading ? "…" : done} sub="Data ready" color="#10b981" icon="✓" />
        <StatCard label="Failed" value={loading ? "…" : failed} sub="Needs review" color="#f43f5e" icon="✕" />
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Recent list */}
        <div className="xl:col-span-3 card-glass p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black tracking-tight">Recent Activity</h2>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
              {recent.length} Jobs
            </div>
          </div>
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="shimmer h-16 w-full rounded-2xl" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-medium italic text-sm border-2 border-dashed border-white/5 rounded-3xl">
              No recent activity. Start your first scrape above.
            </div>
          ) : (
            <div className="flex flex-col">
              {recent.map((job) => <RecentJobRow key={job.id} job={job} />)}
            </div>
          )}
        </div>

        {/* Quick guide */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          <div className="card-glass p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl pointer-events-none">⚡</div>
            <h2 className="text-lg font-black tracking-tight mb-8">Fast Track</h2>
            <div className="flex flex-col gap-6">
              {[
                { title: "Define Target", desc: "Select keywords and geography.", colorClass: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
                { title: "Scale Up", desc: "Enable Fast Mode for 10x speed.", colorClass: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
                { title: "Export Data", desc: "One-click CSV downloads.", colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={`size-10 rounded-xl border flex items-center justify-center text-[10px] font-black shrink-0 group-hover:scale-110 transition-transform ${step.colorClass}`}>
                    0{i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold mb-1 tracking-tight">{step.title}</div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glass p-6 border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs shadow-lg">✉</div>
              <div>
                <div className="text-xs font-bold">Email Scraper</div>
                <div className="text-[10px] text-blue-400/80 font-medium">Capture business leads directly</div>
              </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">MohaDada 😜</div>
          </div>
        </div>
      </div>
    </div>
  );
}
