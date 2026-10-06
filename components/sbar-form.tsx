"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Printer, Save, Send } from "lucide-react";
import { useWard } from "@/lib/store";
import { BedNo, Patient, SBARData, SPECIALTIES, STAFF_LIST, TAG_OPTIONS, gcsTotal, mapValue } from "@/lib/types";
import { tagIcon } from "@/components/tag-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Label, Select, DateInput, Checkbox } from "@/components/ui/inputs";
import { Tabs, TabsList, TabsTrigger, TabsContent, Accordion, AccordionItem } from "@/components/ui/tabs-table";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = React.useId();
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, { id })
    : children;
  return <div className="flex flex-col gap-1"><Label htmlFor={id}>{label}</Label>{child}</div>;
}

export default function SBARForm({ bedNo, stayId, onBack, onPrint }: {
  bedNo: BedNo; stayId: string; onBack: () => void; onPrint: (d: SBARData) => void;
}) {
  const ward = useWard();
  const patient = (ward.patients as Record<string, Patient>)[bedNo];
  const initial = useMemo(() => ({ ...ward.getSBAR(stayId), wardBedNo: bedNo, handoverGivenBy: ward.getSBAR(stayId).handoverGivenBy || ward.activeStaff }), []);
  const [form, setForm] = useState<SBARData>(initial);
  // "Handover Given by" is automated to the active user selected via the dashboard staff switcher.
  useEffect(() => {
    setForm((p) => (p.handoverGivenBy === ward.activeStaff ? p : { ...p, handoverGivenBy: ward.activeStaff }));
  }, [ward.activeStaff]);
  const [tab, setTab] = useState("demo");
  const [saved, setSaved] = useState(false);
  const set = (k: keyof SBARData, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const gcs = gcsTotal(form);
  const map = mapValue(form);

  const save = () => { ward.saveSBAR(stayId, form); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const submit = () => {
    if (!form.patientName.trim() || !form.hospitalNo.trim()) { alert("Patient Name and Hospital No are required before submitting a handover."); return; }
    ward.saveSBAR(stayId, form);
    ward.submitHandover(stayId, form);
    alert("Shift handover submitted and archived.");
  };

  const tb = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft /> Dashboard</Button>
        <h2 className="text-lg font-bold">SBAR — {bedNo} · {form.patientName || "Unnamed"}</h2>
        {gcs !== null && <Badge variant="info">GCS {gcs} (E{form.gcsE} V{form.gcsV} M{form.gcsM})</Badge>}
        {map !== null && <Badge variant="info">MAP {map} mmHg</Badge>}
        <span className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={save}><Save /> {saved ? "Saved ✓" : "Save Draft"}</Button>
          <Button variant="outline" size="sm" onClick={() => { save(); onPrint(form); }}><Printer /> Print</Button>
          <Button size="sm" onClick={submit}><Send /> Submit Shift Handover</Button>
        </span>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="sticky top-0 z-30 -mx-4 w-[calc(100%+2rem)] rounded-none border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <TabsTrigger value="demo">Demographics</TabsTrigger>
          <TabsTrigger value="sit">Situation</TabsTrigger>
          <TabsTrigger value="bg">Background</TabsTrigger>
          <TabsTrigger value="ass">Assessment</TabsTrigger>
          <TabsTrigger value="rec">Recommendation</TabsTrigger>
          <TabsTrigger value="safe">Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="demo">
          <Card><CardHeader><CardTitle className="text-sm">Header / Demographics (Page 1)</CardTitle></CardHeader>
          <CardContent className={tb}>
            <Field label="Patient Name"><Input value={form.patientName} onChange={(e) => set("patientName", e.target.value)} /></Field>
            <Field label="Hospital No"><Input value={form.hospitalNo} onChange={(e) => set("hospitalNo", e.target.value)} /></Field>
            <Field label="Age / Sex"><Input value={form.ageSex} onChange={(e) => set("ageSex", e.target.value)} placeholder="62/M" /></Field>
            <Field label="Ward / Bed No"><Input value={form.wardBedNo} onChange={(e) => set("wardBedNo", e.target.value)} /></Field>
            <Field label="Date and Time of Admission"><Input value={form.admissionDateTime} onChange={(e) => set("admissionDateTime", e.target.value)} placeholder="YYYY-MM-DD HH:mm" /></Field>
            <Field label="Shift Type">
              <Select value={form.shiftType} onChange={(e) => set("shiftType", e.target.value)}>
                <option>Morning</option><option>Evening</option><option>Night</option>
              </Select>
            </Field>
            <div className="flex flex-wrap items-center gap-4">
              <Checkbox checked={form.newShiftHandover} onChange={(v) => set("newShiftHandover", v)} label="New Shift Handover" />
              <Checkbox checked={form.transferHandover} onChange={(v) => set("transferHandover", v)} label="Transfer Handover" />
            </div>
            <Field label="Date"><DateInput value={form.date} onChange={(e) => set("date", e.target.value)} /></Field>
            <Field label="Time"><Input value={form.admissionTime} onChange={(e) => set("admissionTime", e.target.value)} placeholder="HH:mm" /></Field>
            <Field label="Specialty (dashboard pill only — not printed)">
              <Select value={patient?.specialty || ""} onChange={(e) => ward.updatePatient(bedNo, { specialty: e.target.value })}>
                <option value="" disabled>Select specialty…</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label>Active tags (dashboard pills — add / remove anytime, not printed)</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {TAG_OPTIONS.map((t) => {
                  const on = patient?.tags.includes(t) ?? false;
                  const TIcon = tagIcon(t);
                  return (
                    <button key={t} type="button" disabled={!patient} onClick={() => {
                      if (!patient) return;
                      ward.updatePatient(bedNo, { tags: on ? patient.tags.filter((x) => x !== t) : [...patient.tags, t] });
                    }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${on ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"}`}>
                      <TIcon className="h-3 w-3" />{t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
              <Checkbox checked={form.correctIdBand} onChange={(v) => set("correctIdBand", v)} label="Correct ID Band Insitu" />
              <Checkbox checked={form.selfIntroduction} onChange={(v) => set("selfIntroduction", v)} label="Self-Introduction to Patient/Guardian" />
            </div>
            <Field label="Handover Given by"><Input value={form.handoverGivenBy} onChange={(e) => set("handoverGivenBy", e.target.value)} /></Field>
            <Field label="Sign (given)"><Input value={form.givenSign} onChange={(e) => set("givenSign", e.target.value)} /></Field>
            <Field label="Handover Received by">
              <Select
                value={form.handoverReceivedBy || "__none"}
                onChange={(e) => set("handoverReceivedBy", e.target.value === "__none" ? "" : e.target.value)}
              >
                <option value="__none" disabled>Select staff…</option>
                {!STAFF_LIST.includes(form.handoverReceivedBy) && form.handoverReceivedBy && (
                  <option value={form.handoverReceivedBy}>{form.handoverReceivedBy}</option>
                )}
                {STAFF_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Sign (received)"><Input value={form.receivedSign} onChange={(e) => set("receivedSign", e.target.value)} /></Field>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="sit">
          <Card><CardHeader><CardTitle className="text-sm">Situation</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label="Day of Admission in ICU"><Input value={form.dayOfAdmission} onChange={(e) => set("dayOfAdmission", e.target.value)} /></Field>
            <Field label="POD"><Input value={form.pod} onChange={(e) => set("pod", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Code Status"><Input value={form.codeStatus} onChange={(e) => set("codeStatus", e.target.value)} placeholder="Full code / DNR ..." /></Field></div>
            <div className="sm:col-span-2"><Field label="Present Diagnosis"><Textarea value={form.presentDiagnosis} onChange={(e) => set("presentDiagnosis", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Current Clinical Status"><Textarea value={form.currentClinicalStatus} onChange={(e) => set("currentClinicalStatus", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Present Treatment & Medications"><Textarea value={form.presentTreatment} onChange={(e) => set("presentTreatment", e.target.value)} /></Field></div>
            <Field label="Weight"><Input value={form.weight} onChange={(e) => set("weight", e.target.value)} /></Field>
            <Field label="Blood Group"><Input value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)} /></Field>
            <Field label="Allergies"><Input value={form.allergies} onChange={(e) => set("allergies", e.target.value)} /></Field>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="bg">
          <Card><CardHeader><CardTitle className="text-sm">Background</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {([
              ["medSurgHistory", "Medical / Surgical History"],
              ["obstetricHistory", "Obstetric History"],
              ["admissionContext", "Admission Context"],
              ["investigations", "Investigations"],
              ["cultures", "Cultures"],
              ["radiology", "Radiology"],
              ["medications", "Medications"],
              ["procedures", "Procedures / Interventions"],
              ["consentsBg", "Consents"],
              ["remarksBg", "Remarks"],
            ] as [keyof SBARData, string][]).map(([k, label]) => (
              <div key={k} className="sm:col-span-1"><Field label={label}><Textarea value={String(form[k] ?? "")} onChange={(e) => set(k, e.target.value)} /></Field></div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="ass">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Assessment related to present condition (auto: GCS total &amp; MAP)</CardTitle></CardHeader>
              <CardContent>
                <Accordion>
                  <AccordionItem title="Neuro" defaultOpen>
                    <div className={tb}>
                      <Field label="GCS Eye (1–4)"><Input value={form.gcsE} onChange={(e) => set("gcsE", e.target.value)} inputMode="numeric" /></Field>
                      <Field label="GCS Verbal (1–5)"><Input value={form.gcsV} onChange={(e) => set("gcsV", e.target.value)} inputMode="numeric" /></Field>
                      <Field label="GCS Motor (1–6)"><Input value={form.gcsM} onChange={(e) => set("gcsM", e.target.value)} inputMode="numeric" /></Field>
                      <div className="flex items-end pb-1 text-sm font-semibold text-cyan-700 dark:text-cyan-300">GCS Total: {gcs ?? "— (enter E+V+M)"}</div>
                      <Field label="RASS"><Input value={form.rass} onChange={(e) => set("rass", e.target.value)} /></Field>
                      <Field label="Muscle Strength"><Input value={form.muscleStrength} onChange={(e) => set("muscleStrength", e.target.value)} /></Field>
                      <Field label="Pupils"><Input value={form.pupils} onChange={(e) => set("pupils", e.target.value)} /></Field>
                    </div>
                  </AccordionItem>
                  <AccordionItem title="Cardiac / Pulmonary" defaultOpen>
                    <div className={tb}>
                      <Field label="Hemodynamic Status"><Input value={form.hemodynamicStatus} onChange={(e) => set("hemodynamicStatus", e.target.value)} /></Field>
                      <Field label="Systolic BP"><Input value={form.sysBP} onChange={(e) => set("sysBP", e.target.value)} inputMode="numeric" /></Field>
                      <Field label="Diastolic BP"><Input value={form.diaBP} onChange={(e) => set("diaBP", e.target.value)} inputMode="numeric" /></Field>
                      <div className="flex items-end pb-1 text-sm font-semibold text-cyan-700 dark:text-cyan-300">MAP: {map !== null ? `${map} mmHg` : "—"} ((Sys + 2×Dia)/3)</div>
                      <Field label="SpO2 (%)"><Input value={form.spo2} onChange={(e) => set("spo2", e.target.value)} /></Field>
                      <Field label="Vent / NIV / O2 / Room Air"><Input value={form.ventMode} onChange={(e) => set("ventMode", e.target.value)} /></Field>
                      <Field label="ET Size"><Input value={form.etSize} onChange={(e) => set("etSize", e.target.value)} /></Field>
                      <Field label="ET Position"><Input value={form.etPosition} onChange={(e) => set("etPosition", e.target.value)} /></Field>
                      <Field label="Ventilator Settings"><Input value={form.ventSettings} onChange={(e) => set("ventSettings", e.target.value)} /></Field>
                    </div>
                  </AccordionItem>
                  <AccordionItem title="Lines, Tubing's, Drains, Skin / Access" defaultOpen>
                    <div className={tb}>
                      <Field label="Invasive Access"><Input value={form.invasiveAccess} onChange={(e) => set("invasiveAccess", e.target.value)} /></Field>
                      <Field label="Invasive Patency"><Input value={form.invasivePatency} onChange={(e) => set("invasivePatency", e.target.value)} /></Field>
                      <Field label="Peripheral Access"><Input value={form.peripheralAccess} onChange={(e) => set("peripheralAccess", e.target.value)} /></Field>
                      <Field label="Peripheral Patency"><Input value={form.peripheralPatency} onChange={(e) => set("peripheralPatency", e.target.value)} /></Field>
                      <Field label="VIP Score"><Input value={form.vipScore} onChange={(e) => set("vipScore", e.target.value)} /></Field>
                      <Field label="Braden Score"><Input value={form.bradenScore} onChange={(e) => set("bradenScore", e.target.value)} inputMode="numeric" /></Field>
                      <div className="sm:col-span-2"><Field label="Drain Amount & Status"><Textarea value={form.drainStatus} onChange={(e) => set("drainStatus", e.target.value)} /></Field></div>
                      <div className="sm:col-span-2"><Field label="Wound Status"><Textarea value={form.woundStatus} onChange={(e) => set("woundStatus", e.target.value)} /></Field></div>
                    </div>
                  </AccordionItem>
                  <AccordionItem title="GI / Urinary Intake / Output" defaultOpen>
                    <div className={tb}>
                      <div className="sm:col-span-2 lg:col-span-3"><Field label="Feed type · amount · frequency · route"><Input value={form.feedDetail} onChange={(e) => set("feedDetail", e.target.value)} /></Field></div>
                      <Field label="Intake"><Input value={form.intake} onChange={(e) => set("intake", e.target.value)} /></Field>
                      <Field label="Output"><Input value={form.output} onChange={(e) => set("output", e.target.value)} /></Field>
                      <Field label="Blood Transfusion"><Input value={form.bloodTransfusion} onChange={(e) => set("bloodTransfusion", e.target.value)} /></Field>
                      <Field label="GRV / Emesis"><Input value={form.grvEmesis} onChange={(e) => set("grvEmesis", e.target.value)} /></Field>
                      <Field label="HD Status"><Input value={form.hdStatus} onChange={(e) => set("hdStatus", e.target.value)} /></Field>
                      <Field label="UF"><Input value={form.uf} onChange={(e) => set("uf", e.target.value)} /></Field>
                      <Field label="Fluid Restriction"><Input value={form.fluidRestriction} onChange={(e) => set("fluidRestriction", e.target.value)} /></Field>
                      <Field label="Stool: King's Type | Color | Frequency"><Input value={form.stool} onChange={(e) => set("stool", e.target.value)} /></Field>
                      <div className="sm:col-span-2 lg:col-span-3"><Field label="Remarks"><Textarea value={form.remarksAssess} onChange={(e) => set("remarksAssess", e.target.value)} /></Field></div>
                    </div>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rec">
          <Card><CardHeader><CardTitle className="text-sm">Recommendation</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {([
              ["priorityActions", "Priority Actions"],
              ["routineActions", "Routine Actions"],
              ["pendingReports", "Pending Reports"],
              ["pendingReferrals", "Pending Referrals"],
              ["consentsRec", "Consents"],
              ["familyUpdate", "Patient Education & Family update"],
              ["remarksRec", "Remarks"],
            ] as [keyof SBARData, string][]).map(([k, label]) => (
              <div key={k}><Field label={label}><Textarea value={String(form[k] ?? "")} onChange={(e) => set(k, e.target.value)} /></Field></div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="safe">
          <Card><CardHeader><CardTitle className="text-sm">Safety</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
              <Checkbox checked={form.restraints} onChange={(v) => set("restraints", v)} label="Restraints" />
              <Checkbox checked={form.fallRisk} onChange={(v) => set("fallRisk", v)} label="Fall Risk" />
              <Checkbox checked={form.deliriumRisk} onChange={(v) => set("deliriumRisk", v)} label="Delirium Risk" />
              <Checkbox checked={form.incident} onChange={(v) => set("incident", v)} label="Incident" />
              <Checkbox checked={form.ipcUniversal} onChange={(v) => set("ipcUniversal", v)} label="Universal Precaution" />
              <Checkbox checked={form.ipcStandard} onChange={(v) => set("ipcStandard", v)} label="Standard Precaution" />
              <Checkbox checked={form.ipcIsolated} onChange={(v) => set("ipcIsolated", v)} label="Isolated" />
            </div>
            <Field label="Mobility Status"><Input value={form.mobilityStatus} onChange={(e) => set("mobilityStatus", e.target.value)} /></Field>
            <Field label="Equipment related injuries"><Input value={form.equipmentInjury} onChange={(e) => set("equipmentInjury", e.target.value)} /></Field>
            <Field label="Psychological Well-being"><Input value={form.psychWellbeing} onChange={(e) => set("psychWellbeing", e.target.value)} /></Field>
            <Field label="IPC Remarks"><Input value={form.ipcRemarks} onChange={(e) => set("ipcRemarks", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Fall / Delirium / Incident / ADR Remarks"><Textarea value={form.safetyRemarks} onChange={(e) => set("safetyRemarks", e.target.value)} /></Field></div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={save}><Save /> Save Draft</Button>
        <Button onClick={submit}><Send /> Submit Shift Handover</Button>
        <Button variant="outline" onClick={() => onPrint(form)}><Printer /> Preview / Print Form</Button>
      </div>
    </div>
  );
}
