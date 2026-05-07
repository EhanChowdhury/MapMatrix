"use client";

import { useState } from "react";

type View = "dashboard" | "jobs" | "new-job" | "settings";

interface SidebarProps {
  view: View;
  onViewChange: (v: View) => void;
  jobCount: number;
}

const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "jobs", label: "Jobs", icon: "◈" },
  { id: "settings", label: "Settings", icon: "◎" },
];

export default function Sidebar({ view, onViewChange, jobCount }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="sidebar"
      style={{ width: collapsed ? 60 : 240, minWidth: collapsed ? 60 : 240, transition: "width 0.25s, min-width 0.25s" }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "20px 0" : "22px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 10,
        }}
      >
        {!collapsed && (
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              MapMatrix
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 }}>
              by Sytax
            </div>
          </div>
        )}

        {collapsed && (
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#fff", fontWeight: 800,
            }}
          >
            M
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost"
          style={{ padding: "4px 6px", fontSize: 14, minWidth: 0 }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {!collapsed && (
          <div className="section-heading" style={{ marginBottom: 8 }}>
            Navigation
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              style={{
                justifyContent: collapsed ? "center" : undefined,
                padding: collapsed ? "10px" : undefined,
                position: "relative",
              }}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.id === "jobs" && jobCount > 0 && (
                    <span
                      style={{
                        background: "var(--accent)",
                        color: "#fff",
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 7px",
                        minWidth: 20,
                        textAlign: "center",
                      }}
                    >
                      {jobCount}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* New Job Button */}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => onViewChange("new-job")}
            className="btn btn-primary"
            style={{
              width: collapsed ? 40 : "100%",
              padding: collapsed ? "10px" : undefined,
              justifyContent: "center",
              fontSize: 13,
            }}
            title={collapsed ? "New Job" : undefined}
          >
            {collapsed ? "+" : <><span style={{ fontSize: 16 }}>+</span> New Job</>}
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: collapsed ? "16px 10px" : "16px 20px",
          borderTop: "1px solid var(--border)",
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        {!collapsed && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>API Endpoint</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--accent)", wordBreak: "break-all" }}>
              localhost:8080
            </div>
          </>
        )}
        {collapsed && (
          <div style={{ textAlign: "center", fontSize: 14 }}>🟢</div>
        )}
      </div>
    </aside>
  );
}
