"use client";

import { useEffect, useState } from "react";
import { Eye, LayoutGrid, List, RotateCcw, Search, X } from "lucide-react";
import { useWard } from "@/lib/store";
import { DischargeOutcome } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/inputs";
import { StaffAvatar } from "@/components/staff-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import DischargeDetailsDialog from "@/components/discharge-details-dialog";
import { DischargeRecord } from "@/lib/types";

function outcomeVariant(o: DischargeOutcome) {
  if (o === "Discharged") return "success" as const;
  if (o === "Shifted out") return "info" as const;
  return "secondary" as const;
}

export default function Discharges({ onReadmit }: { onReadmit: (hospitalNo: string) => void }) {
  const ward = useWard();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">(() => {
    try { return (localStorage.getItem("icu-discharge-view") as "grid" | "list") || "grid"; } catch { return "grid"; }
  });
  const [details, setDetails] = useState<DischargeRecord | null>(null);
  useEffect(() => {
    try { localStorage.setItem("icu-discharge-view", view); } catch { /* ignore */ }
  }, [view]);
  const q = query.trim().toLowerCase();
  const rows = ward.discharges.filter((d) =>
    q === "" ||
    d.hospitalNo.toLowerCase().includes(q) ||
    d.patientName.toLowerCase().includes(q)
  );
  const viewBtn = (v: "grid" | "list", label: string, Icon: typeof LayoutGrid) => (
    <button key={v} type="button" title={label} aria-label={label} aria-pressed={view === v} onClick={() => setView(v)}
      className={cn(
        "rounded-full p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
        view === v ? "bg-cyan-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      )}>
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hospital number…" aria-label="Search discharge history by hospital number" className="pl-8 pr-8" />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" role="group" aria-label="Discharge view">
          {viewBtn("grid", "Grid view", LayoutGrid)}
          {viewBtn("list", "List view", List)}
        </div>
      </div>
      {ward.discharges.length > 0 && (
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          Showing {rows.length} of {ward.discharges.length} recorded{q && <> for “{query.trim()}”</>}
        </p>
      )}
      {rows.length === 0 ? (
        <p className="rounded-xl border bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          {ward.discharges.length === 0
            ? "No discharges recorded yet. Discharging a bed files the outcome here and saves the patient under their hospital number for future readmission."
            : `No discharges match “${query.trim()}”. Try a different hospital number or name.`}
        </p>
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((d, i) => (
            <Card key={d.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <StaffAvatar name={d.patientName} size="sm" />
                    <span className="truncate">{d.patientName}</span>
                  </span>
                  <Badge variant={outcomeVariant(d.outcome)}>{d.outcome}</Badge>
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {d.hospitalNo} · {d.age}/{d.sex} · {d.bedNo}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>{new Date(d.datetime).toLocaleString()}</span>
                  <span>Recorded by {d.recordedBy}</span>
                </div>
                {d.note && <p className="text-xs italic">“{d.note}”</p>}
                <div className="flex justify-end gap-1.5 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setDetails(d)}><Eye /> View</Button>
                  <Button size="sm" variant="outline" onClick={() => onReadmit(d.hospitalNo)}><RotateCcw /> Re-admit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="animate-fade divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {rows.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 p-3">
              <StaffAvatar name={d.patientName} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{d.patientName}</span>
                <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {d.hospitalNo} · {d.bedNo} · {new Date(d.datetime).toLocaleString()}
                </span>
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <Badge variant={outcomeVariant(d.outcome)}>{d.outcome}</Badge>
                <Button size="icon" variant="outline" aria-label={`View discharge details for ${d.patientName}`} onClick={() => setDetails(d)}><Eye /></Button>
                <Button size="sm" variant="outline" onClick={() => onReadmit(d.hospitalNo)}><RotateCcw /> <span className="hidden sm:inline">Re-admit</span></Button>
              </span>
            </div>
          ))}
        </div>
      )}
      {details && <DischargeDetailsDialog record={details} onClose={() => setDetails(null)} onReadmit={onReadmit} />}
    </div>
  );
}
