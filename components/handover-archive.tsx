"use client";

import { useEffect, useState } from "react";
import { Download, Eye, LayoutGrid, List, Printer, Search, X } from "lucide-react";
import { useWard } from "@/lib/store";
import { SBARData } from "@/lib/types";
import { downloadFile, toCSV } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/inputs";
import { StaffAvatar } from "@/components/staff-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HandoverArchive({ onView, onReprint }: { onView: (s: SBARData) => void; onReprint: (s: SBARData) => void }) {
  const ward = useWard();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">(() => {
    try { return (localStorage.getItem("icu-handover-view") as "grid" | "list") || "grid"; } catch { return "grid"; }
  });
  useEffect(() => {
    try { localStorage.setItem("icu-handover-view", view); } catch { /* ignore */ }
  }, [view]);

  const q = query.trim().toLowerCase();
  const rows = ward.handovers.filter((h) =>
    q === "" ||
    h.patientName.toLowerCase().includes(q) ||
    h.hospitalNo.toLowerCase().includes(q) ||
    h.bedNo.toLowerCase().includes(q) ||
    h.shiftType.toLowerCase().includes(q)
  );

  const exportJSON = (snap: SBARData, id: string) => downloadFile(`handover-${id}.json`, JSON.stringify(snap, null, 2), "application/json");
  const exportCSV = () => {
    const flat = rows.map((h) => ({ id: h.id, datetime: h.datetime, bedNo: h.bedNo, patientName: h.patientName, hospitalNo: h.hospitalNo, shiftType: h.shiftType, givenBy: h.givenBy, receivedBy: h.receivedBy }));
    downloadFile("handover-archive.csv", toCSV(flat), "text/csv");
  };

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
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient, number, bed…" aria-label="Search handover archive" className="pl-8 pr-8" />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" role="group" aria-label="Handover view">
            {viewBtn("grid", "Grid view", LayoutGrid)}
            {viewBtn("list", "List view", List)}
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={rows.length === 0}><Download /> <span className="hidden sm:inline">Export CSV</span></Button>
        </div>
      </div>
      {ward.handovers.length > 0 && (
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          Showing {rows.length} of {ward.handovers.length} archived{q && <> for “{query.trim()}”</>}
        </p>
      )}
      {rows.length === 0 ? (
        <p className="rounded-xl border bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          {ward.handovers.length === 0
            ? "No handovers archived yet. Each “Submit Shift Handover” stores an immutable snapshot here."
            : `No handovers match “${query.trim()}”. Try a different search.`}
        </p>
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((h, i) => (
            <Card key={h.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <StaffAvatar name={h.patientName} size="sm" />
                    <span className="truncate">{h.patientName}</span>
                  </span>
                  <Badge variant="secondary">{h.shiftType}</Badge>
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {h.bedNo} · {h.hospitalNo} · {new Date(h.datetime).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="flex items-center gap-1.5"><StaffAvatar name={h.givenBy} size="xs" />{h.givenBy}</span>
                  <span className="text-slate-400">→</span>
                  <span className="flex items-center gap-1.5">{h.receivedBy ? <><StaffAvatar name={h.receivedBy} size="xs" />{h.receivedBy}</> : "—"}</span>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 pt-1">
                  <Button size="sm" variant="outline" onClick={() => onView(h.snapshot)}><Eye /> View</Button>
                  <Button size="sm" variant="outline" onClick={() => onReprint(h.snapshot)}><Printer /> Re-Print</Button>
                  <Button size="sm" variant="ghost" onClick={() => exportJSON(h.snapshot, h.id)}><Download /> JSON</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="animate-fade divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {rows.map((h) => (
            <div key={h.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 p-3">
              <StaffAvatar name={h.patientName} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{h.patientName}</span>
                <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {h.bedNo} · {h.hospitalNo} · {h.shiftType} · {new Date(h.datetime).toLocaleString()}
                </span>
              </span>
              <span className="flex min-w-0 basis-full items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 sm:basis-auto">
                <StaffAvatar name={h.givenBy} size="xs" />
                <span className="truncate">{h.givenBy}</span>
                <span aria-hidden>→</span>
                {h.receivedBy ? <><StaffAvatar name={h.receivedBy} size="xs" /><span className="truncate">{h.receivedBy}</span></> : <span>—</span>}
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <Button size="icon" variant="outline" aria-label={`View handover for ${h.patientName}`} onClick={() => onView(h.snapshot)}><Eye /></Button>
                <Button size="icon" variant="outline" aria-label={`Re-print handover for ${h.patientName}`} onClick={() => onReprint(h.snapshot)}><Printer /></Button>
                <Button size="icon" variant="ghost" aria-label={`Export handover JSON for ${h.patientName}`} onClick={() => exportJSON(h.snapshot, h.id)}><Download /></Button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
