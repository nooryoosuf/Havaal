"use client";

import { BedDouble, ClipboardList, History, LogOut, Plus, Printer, Stethoscope } from "lucide-react";
import { useWard } from "@/lib/store";
import { BED_ORDER_LEFT, BED_ORDER_RIGHT, BedNo, Patient } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/aceternity/glow-card";
import { tagIcon } from "@/components/tag-pill";

function tagVariant(t: string) {
  const l = t.toLowerCase();
  if (l.includes("vent")) return "destructive" as const;
  if (l.includes("isolat")) return "warning" as const;
  if (l.includes("fall") || l.includes("delirium")) return "warning" as const;
  if (l.includes("line") || l.includes("dialysis")) return "info" as const;
  return "secondary" as const;
}

function BedCard({ bedNo, onAdmit, onForm, onHistory, onPrint, onDischarge }: {
  bedNo: BedNo;
  onAdmit: (b: BedNo) => void;
  onForm: (b: BedNo) => void;
  onHistory: (s: { stayId: string; bedNo: BedNo; name: string; hospitalNo: string }) => void;
  onPrint: (d: any) => void;
  onDischarge: (b: BedNo) => void;
}) {
  const ward = useWard();
  const patient: Patient | undefined = (ward.patients as Record<string, Patient>)[bedNo];

  if (!patient) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-slate-400 dark:text-slate-500" />{bedNo}</span>
            <Badge variant="success">Vacant</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">Bed ready for admission.</p>
          <Button size="sm" variant="outline" onClick={() => onAdmit(bedNo)}><Plus /> Admit Patient</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-solid">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-slate-700 dark:text-slate-300" />{bedNo}</span>
          <Badge variant="destructive">Occupied</Badge>
        </CardTitle>
        <div>
          <p className="flex items-center justify-between gap-2 text-base font-bold leading-tight">
            <span>{patient.name}</span>
            {patient.specialty && <Badge variant="info" className="shrink-0 px-2.5 py-0.5 text-xs font-bold"><Stethoscope className="h-3.5 w-3.5" />{patient.specialty}</Badge>}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{patient.age}/{patient.sex} · {patient.hospitalNo} · {bedNo}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-xs"><span className="font-semibold">Dx:</span> {patient.diagnosis || "—"}</p>
        <div className="flex flex-wrap gap-1">
          {patient.tags.length === 0 && <span className="text-[11px] text-slate-400">No active tags</span>}
          {patient.tags.map((t) => {
            const TIcon = tagIcon(t);
            return <Badge key={t} variant={tagVariant(t)}><TIcon className="h-3 w-3" />{t}</Badge>;
          })}
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Button size="sm" onClick={() => onForm(bedNo)}><ClipboardList /> Fill / Edit SBAR</Button>
          <Button size="sm" variant="secondary" onClick={() => onHistory({ stayId: patient.stayId, bedNo, name: patient.name, hospitalNo: patient.hospitalNo })}><History /> Shift History</Button>
          <Button size="sm" variant="outline" onClick={() => onPrint(ward.getSBAR(patient.stayId))}><Printer /> Print Form</Button>
          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/60 dark:hover:text-red-300" onClick={() => onDischarge(bedNo)}>
            <LogOut /> Discharge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BedGrid(props: {
  onAdmit: (b: BedNo) => void;
  onForm: (b: BedNo) => void;
  onHistory: (s: { stayId: string; bedNo: BedNo; name: string; hospitalNo: string }) => void;
  onPrint: (d: any) => void;
  onDischarge: (b: BedNo) => void;
}) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          {BED_ORDER_LEFT.map((b, i) => <GlowCard key={b} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}><BedCard bedNo={b} {...props} /></GlowCard>)}
        </div>
        <div className="flex flex-col gap-4">
          {BED_ORDER_RIGHT.map((b, i) => <GlowCard key={b} className="animate-fade-up" style={{ animationDelay: `${(i + 5) * 60}ms` }}><BedCard bedNo={b} {...props} /></GlowCard>)}
        </div>
      </div>
    </div>
  );
}
