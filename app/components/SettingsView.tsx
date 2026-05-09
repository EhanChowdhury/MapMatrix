"use client";

import { useState } from "react";

interface Props {}

export default function SettingsView({}: Props) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-black tracking-tightest mb-2">Global Settings</h1>
        <p className="text-slate-500 font-medium">System configuration and environment manifest.</p>
      </div>

      {/* About */}
      <div className="card-glass p-10">
        <h2 className="text-lg font-black tracking-tight mb-8">System Manifest</h2>
        <div className="flex flex-col gap-2">
          {[
            ["Module", "MapMatrix Core Engine"],
            ["Developer", "Sytax Development"],
            ["Version", "1.0.2 Stable"],
            ["License", "Enterprise Node"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-4 border-b border-white/[0.03] last:border-0">
              <span className="text-sm font-bold text-slate-500">{k}</span>
              <span className="text-sm font-black text-foreground tracking-tight">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
