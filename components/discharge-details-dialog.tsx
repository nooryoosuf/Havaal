"use client";

import { RotateCcw } from "lucide-react";
import { DischargeOutcome, DischargeRecord } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function outcomeVariant(o: DischargeOutcome) {
  if (o === "Discharged") return "success" as const;
  if (o === "Shifted out") return "info" as const;
  return "secondary" as const;
}

function stayLength(admittedAt: string, datetime: string): string {
  const ms = new Date(datetime).getTime() - new Date(admittedAt).getTime();
  if (Number.isNaN(ms) || ms < 0) return "—";
  const hours = Math.floor(ms / 36e5);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem === 0 ? `${days} day${days === 1 ? "" : "s"}` : `${days}d ${rem}h`;
}

export default function DischargeDetailsDialog({ record, onClose, onReadmit }: {
  record: DischargeRecord;
  onClose: () => void;
  onReadmit: (hospitalNo: string) => void;
}) {
  const rows: Array<[string, React.ReactNode]> = [
    ["Patient", record.patientName],
    ["Hospital No", record.hospitalNo],
    ["Age / Sex", `${record.age} / ${record.sex}`],
    ["Bed", record.bedNo],
    ["Diagnosis", record.diagnosis || "—"],
    ["Category", record.category || "—"],
    ["Specialty", record.specialty || "—"],
    ["Outcome", <Badge key="o" variant={outcomeVariant(record.outcome)}>{record.outcome}</Badge>],
    ["Admitted", new Date(record.admittedAt).toLocaleString()],
    ["Discharged", new Date(record.datetime).toLocaleString()],
    ["ICU stay length", stayLength(record.admittedAt, record.datetime)],
    ["Recorded by", record.recordedBy],
    ["Note", record.note || "—"],
  ];
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <div className="mx-auto max-w-lg">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle>Discharge details — {record.patientName}</DialogTitle>
          <DialogDescription>{record.hospitalNo} · {record.bedNo}</DialogDescription>
        </DialogHeader>
        <DialogContent>
          <dl className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map(([k, val]) => (
              <div key={k} className="flex items-start justify-between gap-4 py-1.5 text-sm">
                <dt className="shrink-0 text-slate-500 dark:text-slate-400">{k}</dt>
                <dd className="text-right font-medium">{val}</dd>
              </div>
            ))}
          </dl>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={() => { onReadmit(record.hospitalNo); onClose(); }}><RotateCcw /> Re-admit</Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
