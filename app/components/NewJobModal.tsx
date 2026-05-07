"use client";

import { useState } from "react";
import type { Job } from "../types";

interface Props {
  onJobCreated: (job: Job) => void;
  onClose: () => void;
  apiBase: string;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "el", label: "Greek" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "nl", label: "Dutch" },
  { code: "ru", label: "Russian" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
];

export default function NewJobModal({ onJobCreated, onClose, apiBase }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [lang, setLang] = useState("en");
  const [zoom, setZoom] = useState(15);
  const [depth, setDepth] = useState(1);
  const [maxTime, setMaxTime] = useState(3600);
  const [radius, setRadius] = useState<number | "">("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [fastMode, setFastMode] = useState(false);
  const [email, setEmail] = useState(false);
  const [proxies, setProxies] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const kwArr = keywords.split("\n").map((k) => k.trim()).filter(Boolean);
    if (!name.trim()) return setError("Job name is required.");
    if (kwArr.length === 0) return setError("At least one keyword is required.");

    const body: Record<string, unknown> = {
      name: name.trim(),
      keywords: kwArr,
      lang,
      zoom,
      depth,
      max_time: maxTime,
      fast_mode: fastMode,
      email,
    };
    if (lat) body.lat = lat;
    if (lon) body.lon = lon;
    if (radius !== "") body.radius = Number(radius);
    const proxyArr = proxies.split("\n").map((p) => p.trim()).filter(Boolean);
    if (proxyArr.length) body.proxies = proxyArr;

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const createdId = data.id || data.ID;
      // Fetch the created job to get full details
      const jobRes = await fetch(`${apiBase}/api/v1/jobs/${createdId}`);
      const rawJob = jobRes.ok ? await jobRes.json() : null;
      const job: Job = rawJob ? {
        id: rawJob.id || rawJob.ID,
        name: rawJob.name || rawJob.Name,
        date: rawJob.date || rawJob.Date,
        status: (rawJob.status || rawJob.Status || "pending").toLowerCase() === "ok" ? "completed" : (rawJob.status || rawJob.Status || "pending"),
        data: rawJob.data || rawJob.Data || {}
      } : { id: createdId, name, date: new Date().toISOString(), status: "pending", data: body as Job["data"] };
      onJobCreated(job);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
              New Scrape Job
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
              Configure and launch a new Maps scraping task
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 18 }}>
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 28px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Name */}
            <div>
              <label className="label">Job Name *</label>
              <input
                className="input"
                placeholder="e.g. Coffee shops in Athens"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="label">Keywords * (one per line)</label>
              <textarea
                className="input"
                placeholder={"coffee in athens\ncafé near acropolis"}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
                required
              />
            </div>

            {/* Row: Lang + Zoom + Depth */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">Language</label>
                <select
                  className="input"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  style={{ appearance: "none" }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Zoom (1–21)</label>
                <input
                  className="input"
                  type="number" min={1} max={21}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label">Depth</label>
                <input
                  className="input"
                  type="number" min={1}
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Row: Lat + Lon + Radius */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">Latitude</label>
                <input className="input" placeholder="37.9838" value={lat} onChange={(e) => setLat(e.target.value)} />
              </div>
              <div>
                <label className="label">Longitude</label>
                <input className="input" placeholder="23.7275" value={lon} onChange={(e) => setLon(e.target.value)} />
              </div>
              <div>
                <label className="label">Radius (m)</label>
                <input
                  className="input" type="number" min={0}
                  placeholder="optional"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>

            {/* Max Time */}
            <div>
              <label className="label">Max Time (seconds)</label>
              <input
                className="input" type="number" min={1}
                value={maxTime}
                onChange={(e) => setMaxTime(Number(e.target.value))}
              />
            </div>

            {/* Toggles */}
            <div style={{ display: "flex", gap: 24, padding: "4px 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "var(--text-secondary)" }}>
                <label className="toggle">
                  <input type="checkbox" checked={fastMode} onChange={(e) => setFastMode(e.target.checked)} />
                  <div className="toggle-track"><div className="toggle-thumb" /></div>
                </label>
                Fast Mode
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "var(--text-secondary)" }}>
                <label className="toggle">
                  <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
                  <div className="toggle-track"><div className="toggle-thumb" /></div>
                </label>
                Extract Emails
              </label>
            </div>

            {/* Proxies */}
            <div>
              <label className="label">Proxies (optional, one per line)</label>
              <textarea
                className="input"
                placeholder={"http://user:pass@host:port"}
                value={proxies}
                onChange={(e) => setProxies(e.target.value)}
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)",
                  borderRadius: "var(--radius-md)", padding: "10px 14px",
                  fontSize: 13, color: "var(--rose)",
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                {loading ? "Creating…" : "Launch Job"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
