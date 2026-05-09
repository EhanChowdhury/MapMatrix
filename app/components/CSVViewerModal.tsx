"use client";

import { useEffect, useState } from "react";

interface Props {
  jobId: string;
  jobName: string;
  apiBase: string;
  onClose: () => void;
}

export default function CSVViewerModal({ jobId, jobName, apiBase, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    async function fetchCSV() {
      try {
        const res = await fetch(`${apiBase}/api/v1/jobs/${jobId}/download`);
        if (!res.ok) throw new Error("Failed to fetch CSV data");
        const text = await res.text();
        
        // Simple CSV parser (handles basic commas and newlines)
        // For production, a library like papaparse would be better, but let's stick to vanilla
        const rows = text.split("\n").filter(row => row.trim() !== "").map(row => {
          // Very basic CSV split (doesn't handle commas inside quotes)
          return row.split(",").map(cell => cell.replace(/^"(.*)"$/, "$1").trim());
        });
        
        setData(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchCSV();
  }, [jobId, apiBase]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0a0d14] border border-white/10 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] max-w-6xl w-full max-h-[85vh] flex flex-col p-0 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight">{jobName}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Previewing extracted leads dataset</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => window.open(`${apiBase}/api/v1/jobs/${jobId}/download`, "_blank")}
               className="btn-premium border border-white/10 hover:bg-white/5 text-xs px-4"
             >
               Download CSV
             </button>
             <button onClick={onClose} className="size-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-xl text-slate-500">
               ×
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#05070a]">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="size-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-500">Parsing Matrix Data...</p>
            </div>
          ) : error ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <div className="text-3xl">⚠</div>
               <p className="text-rose-400 font-bold">{error}</p>
            </div>
          ) : data.length === 0 ? (
             <div className="p-20 text-center text-slate-500 italic">No data found in this job.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="sticky top-0 z-10 bg-[#0a0d14] shadow-md">
                  <tr>
                    {data[0].map((header, i) => (
                      <th key={i} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/10">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {data.slice(1).map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      {row.map((cell, j) => (
                        <td key={j} className="px-6 py-4 text-[13px] text-slate-300 font-medium">
                          {cell || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between shrink-0">
           <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
             {data.length > 0 ? `${data.length - 1} Leads Extracted` : "0 Leads"}
           </div>
           <button onClick={onClose} className="btn-premium btn-premium-primary px-8">
             Close Preview
           </button>
        </div>
      </div>
    </div>
  );
}
