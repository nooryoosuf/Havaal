"use client";

import { useState } from "react";
import { useWard } from "@/lib/store";
import { BedNo, DISCHARGE_OUTCOMES, DischargeOutcome } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/inputs";
import { StaffAvatar } from "@/components/staff-avatar";

export default function DischargeDialog({ bedNo, onClose }: { bedNo: BedNo; onClose: () => void }) {
  const ward = useWard();
  const patient = (ward.patients as Record<string, any>)[bedNo];
  const [outcome, setOutcome] = useState<DischargeOutcome>("Discharged");
  const [note, setNote] = useState("");

  if (!patient) return null;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <div className="mx-auto max-w-lg">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle>Discharge — {bedNo} · {patient.name}</DialogTitle>
          <DialogDescription>
            {patient.hospitalNo} · {patient.age}/{patient.sex} · Admitted {new Date(patient.admittedAt).toLocaleString()}.
            The outcome is saved to discharge history and the bed resets to vacant.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="dc-outcome">Outcome</Label>
              <Select id="dc-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value as DischargeOutcome)}>
                {DISCHARGE_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="dc-note">Note (optional)</Label>
              <Input id="dc-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. shifted to Ward 3B, family informed" />
            </div>
            <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              Recorded by <StaffAvatar name={ward.activeStaff} size="xs" /> {ward.activeStaff}. Patient details stay saved under {patient.hospitalNo} for future readmission.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => { ward.dischargePatient(bedNo, outcome, note.trim()); onClose(); }}>
            Confirm discharge
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
