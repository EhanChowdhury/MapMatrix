"use client";

import { useState } from "react";

interface Props {
  apiBase: string;
  onApiBaseChange: (v: string) => void;
}

export default function SettingsView({ apiBase, onApiBaseChange }: Props) {
  const [draft, setDraft] = useState(apiBase);
  const [saved, setSaved] = useState(false);

  function save() {
    onApiBaseChange(draft.replace(/\/$/, ""));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Configure your MapMatrix dashboard</p>
      </div>

      {/* API Base */}
      <div className="card" style={{ padding: "24px 28px", marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Backend Connection</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.5 }}>
          Requests are proxied through Next.js to avoid CORS. Set the backend target here — it maps to the
          {" "}<code className="mono" style={{ color: "var(--accent)", fontSize: 12 }}>NEXT_PUBLIC_API_BASE</code>{" "}
          env variable (default: <code className="mono" style={{ color: "var(--accent)", fontSize: 12 }}>http://localhost:3000</code>).
          After changing this, restart the dev server.
        </p>

        <label className="label">API Base URL</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="input"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setSaved(false); }}
            placeholder="http://localhost:8080"
          />
          <button
            onClick={save}
            className={`btn ${saved ? "btn-ghost" : "btn-primary"}`}
            style={{ whiteSpace: "nowrap" }}
          >
            {saved ? "✓ Saved" : "Save"}
          </button>
        </div>

        <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Resolved endpoints
          </div>
          {["/api/v1/jobs", "/api/v1/jobs/{id}", "/api/v1/jobs/{id}/download"].map((ep) => (
            <div key={ep} style={{ fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: "var(--text-muted)" }}>{draft || "http://localhost:8080"}</span>
              <span className="mono" style={{ color: "var(--accent)" }}>{ep}</span>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>About MapMatrix</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Product", "MapMatrix Dashboard"],
            ["Made by", "Sytax"],
            ["API Version", "v1.0.0"],
            ["Protocol", "OpenAPI 3.0.3"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(99,120,180,0.08)", fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>{k}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
