"use client";

import { Eye, Printer } from "lucide-react";
import { useWard } from "@/lib/store";
import { BedNo, SBARData } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaffAvatar } from "@/components/staff-avatar";

export default function ShiftHistoryDialog({ stay, onClose, onReprint }: {
  stay: { stayId: string; bedNo: BedNo; name: string; hospitalNo: string };
  onClose: () => void;
  onReprint: (snap: SBARData) => void;
}) {
  const ward = useWard();
  const rows = ward.handoversForStay(stay.stayId);
  const earlier = ward.handovers.filter((h) => h.hospitalNo === stay.hospitalNo && h.stayId !== stay.stayId);
  const item = (h: (typeof rows)[number], tag?: string) => (
    <div key={h.id} className="flex flex-wrap items-center gap-2 rounded-md border p-3 text-sm dark:border-slate-700">
      <Badge variant="secondary">{h.shiftType}</Badge>
      {tag && <Badge variant="outline">{tag}</Badge>}
      <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(h.datetime).toLocaleString()}</span>
      <span className="flex items-center gap-1.5 text-xs"><StaffAvatar name={h.givenBy} size="xs" />{h.givenBy} → {h.receivedBy || "—"}</span>
      <span className="ml-auto flex gap-1">
        <Button size="sm" variant="outline" onClick={() => onReprint(h.snapshot)}><Eye /> View</Button>
        <Button size="sm" variant="outline" onClick={() => onReprint(h.snapshot)}><Printer /> Re-Print</Button>
      </span>
    </div>
  );
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <div className="mx-auto max-w-2xl">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle>Shift History — {stay.bedNo} · {stay.name}</DialogTitle>
          <DialogDescription>Immutable snapshots submitted via “Submit Shift Handover”. Earlier stays for hospital no {stay.hospitalNo} are kept below.</DialogDescription>
        </DialogHeader>
        <DialogContent>
          {rows.length === 0 && earlier.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">No handovers submitted yet for this stay. Fill the SBAR form and click “Submit Shift Handover”.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {rows.length > 0 && <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">This stay</p>}
              {rows.map((h) => item(h))}
              {earlier.length > 0 && <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Earlier stays</p>}
              {earlier.map((h) => item(h, h.bedNo))}
            </div>
          )}
        </DialogContent>
      </div>
    </Dialog>
  );
}
