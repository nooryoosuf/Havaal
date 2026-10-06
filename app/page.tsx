"use client";

import { useState } from "react";
import { Activity, Archive, BarChart3, BedDouble, DoorOpen, Trash2, Sparkles, X } from "lucide-react";
import { useWard } from "@/lib/store";
import { STAFF_LIST } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import StaffSelect from "@/components/staff-select";
import { GridBackdrop } from "@/components/aceternity/grid-backdrop";
import BedGrid from "@/components/bed-grid";
import WardStats from "@/components/ward-stats";
import HandoverArchive from "@/components/handover-archive";
import Discharges from "@/components/discharges";
import SBARForm from "@/components/sbar-form";
import PrintEngine from "@/components/print-engine";
import ShiftHistoryDialog from "@/components/shift-history-dialog";
import AdmitDialog from "@/components/admit-dialog";
import DischargeDialog from "@/components/discharge-dialog";
import { BedNo, Patient, SBARData } from "@/lib/types";

type View = { name: "dashboard" } | { name: "form"; bedNo: BedNo; stayId: string };

export default function HomePage() {
  const ward = useWard();
  const [mainTab, setMainTab] = useState<"beds" | "stats" | "archive" | "discharges">("beds");
  const [view, setView] = useState<View>({ name: "dashboard" });
  const [printData, setPrintData] = useState<SBARData | null>(null);
  const [historyStay, setHistoryStay] = useState<{ stayId: string; bedNo: BedNo; name: string; hospitalNo: string } | null>(null);
  const [admitBed, setAdmitBed] = useState<BedNo | null>(null);
  const [dischargeBed, setDischargeBed] = useState<BedNo | null>(null);
  const [pendingReadmit, setPendingReadmit] = useState<string | null>(null);
  const [archivePrint, setArchivePrint] = useState<SBARData | null>(null);

  const openForm = (bedNo: BedNo) => {
    const p: Patient | undefined = (ward.patients as Record<string, Patient>)[bedNo];
    if (p) setView({ name: "form", bedNo, stayId: p.stayId });
  };

  return (
    <div className="screen-only min-h-screen">
      <GridBackdrop />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-cyan-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white">Skip to content</a>
      {/* Header */}
      <header className={`no-print top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 ${view.name === "form" ? "relative" : "sticky"}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-[0_0_20px_-4px] shadow-cyan-500/60">
              <Activity className="h-5 w-5 animate-heartbeat" />
            </span>
            <div>
              <h1 className="text-sm font-bold leading-tight sm:text-base">ICU Handover &amp; Bed Management System</h1>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-medium text-slate-600 dark:text-slate-300 sm:inline">Active user</span>
              <StaffSelect value={ward.activeStaff} onChange={ward.setActiveStaff} options={STAFF_LIST} />
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => ward.seed()} title="Load demo patients">
              <Sparkles /> Demo data
            </Button>
            <Button variant="ghost" size="sm" onClick={() => ward.resetAll()} title="Clear all">
              <Trash2 /> Clear
            </Button>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-7xl gap-1 px-4 pb-2 md:flex">
          {([["beds", "Bed Dashboard"], ["stats", "Ward Statistics"], ["archive", "Handover Archive"], ["discharges", "Discharges"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => { setMainTab(k); setView({ name: "dashboard" }); }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${mainTab === k ? "bg-cyan-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main id="main-content" className="no-print relative mx-auto max-w-7xl px-4 pt-5 pb-24 md:pb-5">
        {view.name === "form" ? (
          <SBARForm
            bedNo={view.bedNo}
            stayId={view.stayId}
            onBack={() => setView({ name: "dashboard" })}
            onPrint={(d) => setPrintData(d)}
          />
        ) : mainTab === "beds" ? (
          <>
            {pendingReadmit && (
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 p-3 text-sm dark:border-cyan-900 dark:bg-cyan-950/40">
                <span>Re-admitting <b>{ward.registry[pendingReadmit]?.name ?? pendingReadmit}</b> ({pendingReadmit}) — choose a vacant bed and press Admit Patient.</span>
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setPendingReadmit(null)}><X /> Cancel</Button>
              </div>
            )}
            <BedGrid onAdmit={setAdmitBed} onForm={openForm} onHistory={(s) => setHistoryStay(s)} onPrint={setPrintData} onDischarge={setDischargeBed} />
          </>
        ) : mainTab === "stats" ? (
          <WardStats />
        ) : mainTab === "discharges" ? (
          <Discharges onReadmit={(h) => { setPendingReadmit(h); setMainTab("beds"); setView({ name: "dashboard" }); }} />
        ) : (
          <HandoverArchive
            onView={(snap) => setArchivePrint(snap)}
            onReprint={(snap) => setArchivePrint(snap)}
          />
        )}
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:hidden">
        <div className="grid grid-cols-4">
          {([["beds", "Beds", BedDouble], ["stats", "Stats", BarChart3], ["archive", "Archive", Archive], ["discharges", "Out", DoorOpen]] as const).map(([k, label, Icon]) => {
            const active = mainTab === k;
            return (
              <button key={k} onClick={() => { setMainTab(k); setView({ name: "dashboard" }); }} aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500 ${active ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-400"}`}>
                <Icon className="h-5 w-5" />
                {label}
                <span className={`h-1 w-1 rounded-full ${active ? "bg-cyan-500" : "bg-transparent"}`} />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Print overlay */}
      {(printData || archivePrint) && (
        <PrintEngine
          data={(printData ?? archivePrint)!}
          onClose={() => { setPrintData(null); setArchivePrint(null); }}
        />
      )}

      {historyStay && (
        <ShiftHistoryDialog stay={historyStay} onClose={() => setHistoryStay(null)} onReprint={(snap) => { setHistoryStay(null); setArchivePrint(snap); }} />
      )}
      {admitBed && <AdmitDialog bedNo={admitBed} initialHospNo={pendingReadmit} onClose={() => { setAdmitBed(null); setPendingReadmit(null); }} onAdmitted={(b) => { setAdmitBed(null); setPendingReadmit(null); openForm(b); }} />}
      {dischargeBed && <DischargeDialog bedNo={dischargeBed} onClose={() => setDischargeBed(null)} />}
    </div>
  );
}
