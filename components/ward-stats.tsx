"use client";

import { BedDouble, ShieldAlert, Droplets, Wind } from "lucide-react";
import { useWard } from "@/lib/store";
import { ALL_BEDS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowCard } from "@/components/aceternity/glow-card";

export default function WardStats() {
  const ward = useWard();
  const occupied = ALL_BEDS.filter((b) => (ward.patients as Record<string, any>)[b]).length;
  const total = ALL_BEDS.length;
  const pct = Math.round((occupied / total) * 100);
  const isoPatient = (ward.patients as Record<string, any>)["Isolation Bed"];
  const sbarVals = Object.values(ward.sbarByStay) as any[];

  const vent = sbarVals.filter((s) => /vent|simv|ac\/|cmv|ett/i.test(`${s.ventMode} ${s.etSize}`)).length
    + Object.values(ward.patients as Record<string, any>).filter((p: any) => p.tags?.includes("Ventilated")).length;
  const niv = Object.values(ward.patients as Record<string, any>).filter((p: any) => p.tags?.includes("Non-invasive")).length;
  const central = Object.values(ward.patients as Record<string, any>).filter((p: any) => p.tags?.includes("Central Line") || /central|jugular|subclavian|femoral/i.test(`${(sbarVals.find((s) => s.wardBedNo === p.bedNo)?.invasiveAccess) ?? ""}`)).length;
  const dialysis = sbarVals.filter((s) => /hd|dialysis|crtt/i.test(`${s.hdStatus}`)).length
    + Object.values(ward.patients as Record<string, any>).filter((p: any) => p.tags?.includes("Dialysis")).length;
  const bradenLow = sbarVals.filter((s) => s.bradenScore !== "" && parseFloat(s.bradenScore) < 12).length;
  const fallRisk = sbarVals.filter((s) => s.fallRisk).length
    + Object.values(ward.patients as Record<string, any>).filter((p: any) => p.tags?.some((t: string) => /fall/i.test(t))).length;
  const delirium = sbarVals.filter((s) => s.deliriumRisk).length;

  const cats: Record<string, number> = {};
  for (const p of Object.values(ward.patients) as any[]) {
    const key = p.category || p.specialty || "Other";
    cats[key] = (cats[key] ?? 0) + 1;
  }

  const Stat = ({ icon, label, value, sub }: any) => (
    <GlowCard className="animate-fade-up"><Card><CardHeader className="pb-1"><CardTitle className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">{icon}{label}</CardTitle></CardHeader>
    <CardContent><p className="text-2xl font-bold">{value}</p>{sub && <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>}</CardContent></Card></GlowCard>
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<BedDouble className="h-4 w-4" />} label="Occupancy" value={`${occupied} / ${total}`} sub={`${pct}% occupied · ${total - occupied} available`} />
        <Stat icon={<ShieldAlert className="h-4 w-4" />} label="Isolation Bed" value={isoPatient ? "Occupied" : "Available"} sub={isoPatient ? `${isoPatient.name} · ${isoPatient.hospitalNo}` : "Ready for isolation admission"} />
        <Stat icon={<Wind className="h-4 w-4" />} label="Ventilated" value={vent} sub={`${niv} non-invasive`} />
        <Stat icon={<Droplets className="h-4 w-4" />} label="Central Lines" value={central} sub={`${dialysis} dialysis / HD`} />
        <Stat icon={<ShieldAlert className="h-4 w-4" />} label="Braden < 12" value={bradenLow} sub="High pressure-injury risk" />
        <Stat icon={<ShieldAlert className="h-4 w-4" />} label="Fall Risk" value={fallRisk} sub={`${delirium} delirium risk`} />
      </div>
      <h3 className="mb-2 mt-5 text-sm font-bold">Admission Categorization</h3>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(cats).map(([k, v], i) => (
          <GlowCard key={k} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}><Card><CardContent className="pt-4"><p className="text-xl font-bold">{v}</p><p className="text-xs text-slate-500 dark:text-slate-400">{k}</p></CardContent></Card></GlowCard>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Counts derive from live bed occupancy, patient tags and the latest SBAR drafts (ventilator mode, HD status, Braden score, safety flags).</p>
    </div>
  );
}
