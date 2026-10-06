"use client";

import { useEffect, useState } from "react";
import { useWard } from "@/lib/store";
import { BedNo, RegistryEntry, SPECIALTIES, TAG_OPTIONS } from "@/lib/types";
import { tagIcon } from "@/components/tag-pill";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/inputs";
import { Badge } from "@/components/ui/badge";

export default function AdmitDialog({ bedNo, initialHospNo, onClose, onAdmitted }: { bedNo: BedNo; initialHospNo?: string | null; onClose: () => void; onAdmitted: (b: BedNo) => void }) {
  const ward = useWard();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("M");
  const [hospitalNo, setHospitalNo] = useState(initialHospNo ?? "");
  const [diagnosis, setDiagnosis] = useState("");
  const [category, setCategory] = useState("Respiratory");
  const [specialty, setSpecialty] = useState<string>("Internal Medicine");
  const [tags, setTags] = useState<string[]>([]);
  const [restored, setRestored] = useState(false);

  const fillFrom = (e: RegistryEntry) => {
    setName(e.name); setAge(e.age); setSex(e.sex); setHospitalNo(e.hospitalNo);
    setDiagnosis(e.diagnosis); setCategory(e.category); setSpecialty(e.specialty || "Internal Medicine");
    setRestored(true);
  };

  // Returning patient: restore saved details when the dialog opens with a known hospital number.
  useEffect(() => {
    if (initialHospNo && ward.registry[initialHospNo]) fillFrom(ward.registry[initialHospNo]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onHospBlur = () => {
    const key = hospitalNo.trim();
    if (key && !name.trim() && ward.registry[key]) fillFrom(ward.registry[key]);
  };

  const toggle = (t: string) => setTags((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <div className="mx-auto max-w-lg">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle>Admit Patient — {bedNo}</DialogTitle>
          <DialogDescription>Creates a new stay. An SBAR draft is auto-created for this bed.</DialogDescription>
          {restored && <p className="px-5 pt-1"><Badge variant="info">Returning patient — details restored from discharge history</Badge></p>}
        </DialogHeader>
        <DialogContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label htmlFor="ad-name">Patient name</Label><Input id="ad-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kamal Fernando" /></div>
            <div><Label htmlFor="ad-age">Age</Label><Input id="ad-age" value={age} onChange={(e) => setAge(e.target.value)} placeholder="62" /></div>
            <div><Label htmlFor="ad-sex">Sex</Label><Select id="ad-sex" value={sex} onChange={(e) => setSex(e.target.value)}><option>M</option><option>F</option><option>Other</option></Select></div>
            <div><Label htmlFor="ad-hosp">Hospital No</Label><Input id="ad-hosp" value={hospitalNo} onChange={(e) => { setHospitalNo(e.target.value); setRestored(false); }} onBlur={onHospBlur} placeholder="H-00000" /></div>
            <div><Label htmlFor="ad-cat">Category</Label><Select id="ad-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
              {["Respiratory", "Sepsis", "Post-op", "Neuro", "Cardiac", "Other"].map((c) => <option key={c}>{c}</option>)}
            </Select></div>
            <div><Label htmlFor="ad-spec">Specialty (dashboard only)</Label><Select id="ad-spec" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              {SPECIALTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select></div>
            <div className="sm:col-span-2"><Label htmlFor="ad-dx">Primary diagnosis</Label><Input id="ad-dx" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Severe pneumonia" /></div>
            <div className="sm:col-span-2">
              <Label>Active tags</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {TAG_OPTIONS.map((t) => {
                  const TIcon = tagIcon(t);
                  return (
                  <button key={t} type="button" onClick={() => toggle(t)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tags.includes(t) ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"}`}>
                    <TIcon className="h-3 w-3" />{t}
                  </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim() || !hospitalNo.trim()} onClick={() => {
            ward.admit(bedNo, { name: name.trim(), age, sex: sex as any, hospitalNo: hospitalNo.trim(), diagnosis, category: category as any, specialty, tags });
            onAdmitted(bedNo);
          }}>Admit &amp; Open SBAR</Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
