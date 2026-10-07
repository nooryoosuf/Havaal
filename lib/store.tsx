"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ALL_BEDS, BedNo, DischargeOutcome, DischargeRecord, HandoverRecord, Patient, RegistryEntry, SBARData, STAFF_LIST, ShiftId, WorkCellItem, WorkCol, WorkRow, emptySBAR, uid } from "@/lib/types";

interface WardState {
  patients: Record<string, Patient>; // keyed by bedNo
  sbarByStay: Record<string, SBARData>; // keyed by stayId
  handovers: HandoverRecord[];
  discharges: DischargeRecord[];
  registry: Record<string, RegistryEntry>; // keyed by hospitalNo — returning patients
  wItems: WorkCellItem[];
  activeStaff: string;
  setActiveStaff: (s: string) => void;
  admit: (bedNo: BedNo, p: Omit<Patient, "id" | "stayId" | "admittedAt" | "bedNo">) => void;
  discharge: (bedNo: BedNo) => void;
  dischargePatient: (bedNo: BedNo, outcome: DischargeOutcome, note: string) => void;
  addWItem: (it: Omit<WorkCellItem, "id">) => void;
  updateWItem: (id: string, patch: { text?: string; assignee?: string }) => void;
  removeWItem: (id: string) => void;
  wRows: WorkRow[];
  addWRow: (r: Omit<WorkRow, "id">) => void;
  updateWRow: (id: string, patch: Partial<WorkRow>) => void;
  removeWRow: (id: string) => void;
  seedWorkCells: () => void;
  updatePatient: (bedNo: BedNo, patch: Partial<Patient>) => void;
  getSBAR: (stayId: string) => SBARData;
  saveSBAR: (stayId: string, data: SBARData) => void;
  submitHandover: (stayId: string, data: SBARData) => HandoverRecord;
  handoversForStay: (stayId: string) => HandoverRecord[];
  seed: () => void;
  resetAll: () => void;
}

const Ctx = createContext<WardState | null>(null);
const LS_KEY = "icu-ward-v1";

function seedPatients(): Record<string, Patient> {
  const now = new Date().toISOString();
  const mk = (bedNo: BedNo, p: Omit<Patient, "id" | "stayId" | "admittedAt" | "bedNo">): Patient => ({
    ...p,
    id: uid("pt"),
    stayId: uid("stay"),
    bedNo,
    admittedAt: now,
  });
  return {
    "Bed 1": mk("Bed 1", {
      name: "Kamal Fernando", age: "62", sex: "M", hospitalNo: "H-88231",
      diagnosis: "Severe CAP with septic shock", category: "Sepsis", specialty: "Pulmonology",
      tags: ["Ventilated", "High Fall Risk"],
    }),
    "Bed 4": mk("Bed 4", {
      name: "Nadeesha Kumari", age: "45", sex: "F", hospitalNo: "H-90112",
      diagnosis: "Post CABG — POD 2", category: "Post-op", specialty: "Cardiology",
      tags: ["Central Line"],
    }),
    "Bed 7": mk("Bed 7", {
      name: "Ravi Pillai", age: "55", sex: "M", hospitalNo: "H-77402",
      diagnosis: "Acute anterior MI — cardiogenic shock", category: "Cardiac", specialty: "Cardiology",
      tags: ["Dialysis", "Ventilated"],
    }),
  } as Record<string, Patient>;
}

function entryFor(p: { hospitalNo: string; name: string; age: string; sex: Patient["sex"]; diagnosis: string; category: Patient["category"]; specialty: string }, at: string): RegistryEntry {
  return { hospitalNo: p.hospitalNo, name: p.name, age: p.age, sex: p.sex, diagnosis: p.diagnosis, category: p.category, specialty: p.specialty, updatedAt: at };
}
function seedSBAR(patients: Record<string, Patient>): Record<string, SBARData> {
  const out: Record<string, SBARData> = {};
  for (const bedNo of Object.keys(patients)) {
    const p = patients[bedNo];
    out[p.stayId] = emptySBAR({
      patientName: p.name,
      hospitalNo: p.hospitalNo,
      wardBedNo: p.bedNo,
      ageSex: `${p.age}/${p.sex}`,
      presentDiagnosis: p.diagnosis,
      admissionDateTime: new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 16).replace("T", " "),
      dayOfAdmission: "3",
      codeStatus: "Full code",
      handoverGivenBy: STAFF_LIST[0],
      gcsE: "4", gcsV: "1", gcsM: "6",
      sysBP: "118", diaBP: "72", spo2: "96",
      ventMode: p.tags.includes("Ventilated") ? "SIMV-VC" : "Room Air",
      bradenScore: "11",
      shiftType: "Morning",
    });
  }
  return out;
}

export function WardProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [sbarByStay, setSbarByStay] = useState<Record<string, SBARData>>({});
  const [handovers, setHandovers] = useState<HandoverRecord[]>([]);
  const [activeStaff, setActiveStaff] = useState<string>(STAFF_LIST[0]);
  const [discharges, setDischarges] = useState<DischargeRecord[]>([]);
  const [registry, setRegistry] = useState<Record<string, RegistryEntry>>({});
  const [wItems, setWItems] = useState<WorkCellItem[]>([]);
  const [wRows, setWRows] = useState<WorkRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPatients(parsed.patients ?? {});
        setSbarByStay(parsed.sbarByStay ?? {});
        setHandovers(parsed.handovers ?? []);
        setDischarges(parsed.discharges ?? []);
        setRegistry(parsed.registry ?? {});
        setWItems((parsed.wItems ?? []).filter((i: any) => i.col === "staff" || i.col === "mo" || i.col === "attendant"));
        setWRows(parsed.wRows ?? migrateWorkRows(parsed.wItems ?? []));
        setActiveStaff(parsed.activeStaff ?? STAFF_LIST[0]);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ patients, sbarByStay, handovers, discharges, registry, wItems, wRows, activeStaff }));
  }, [patients, sbarByStay, handovers, discharges, registry, wItems, wRows, activeStaff, loaded]);

function migrateWorkRows(items: WorkCellItem[]): WorkRow[] {
  try {
    const groups = new Map<string, WorkRow>();
    for (const it of items) {
      if (it.col !== "alloc" && it.col !== "inventory" && it.col !== "task") continue;
      const key = `${it.shift}|${it.assignee ?? ""}`;
      let r = groups.get(key);
      if (!r) {
        r = { id: uid("wr"), shift: it.shift, staff: it.assignee ?? "", alloc: "", inventory: "", task: "" };
        groups.set(key, r);
      }
      const field = it.col === "alloc" ? "alloc" : it.col === "inventory" ? "inventory" : "task";
      const cur = r[field];
      r[field] = cur ? `${cur}, ${it.text}` : it.text;
    }
    return Array.from(groups.values());
  } catch { return []; }
}

function migrateWorkforce(parsed: any): WorkCellItem[] {
  try {
    const out: WorkCellItem[] = [];
    const push = (shift: ShiftId, col: WorkCol, text: string) => {
      const t = String(text ?? "").trim();
      if (t) out.push({ id: uid("wc"), shift, col, text: t });
    };
    for (const s of (parsed?.wStaff ?? []) as any[])
      push(s.shift, "staff", `${s.name ?? ""}${s.role ? ` — ${s.role}` : ""}${s.area ? ` (${s.area})` : ""}`);
    for (const b of (parsed?.wBeds ?? []) as any[]) {
      push(b.shift, "alloc", `${b.bedNo ?? ""}${b.patient ? `: ${b.patient}` : b.status ? ` — ${b.status}` : ""}${b.note ? ` (${b.note})` : ""}`);
      if (b.medicalOfficer) push(b.shift, "mo", String(b.medicalOfficer));
      if (b.attendant) push(b.shift, "attendant", String(b.attendant));
    }
    for (const t of (parsed?.wTasks ?? []) as any[])
      push(t.shift, t.group === "MO" ? "mo" : "attendant", `${t.desc ?? ""}${t.assignee ? ` — ${t.assignee}` : ""}`);
    for (const it of (parsed?.wInventory ?? []) as any[])
      for (const sh of ["morning", "afternoon", "night"] as ShiftId[])
        push(sh, "inventory", `${it.name ?? ""} — ${it.qty ?? ""} ${it.unit ?? ""}`.trim());
    return out;
  } catch { return []; }
}

const value = useMemo<WardState>(() => ({
    patients, sbarByStay, handovers, discharges, registry, wItems, wRows, activeStaff, setActiveStaff,
    addWItem: (it) => setWItems((prev) => [...prev, { ...it, id: uid("wc") }]),
    updateWItem: (id, patch) => setWItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeWItem: (id) => setWItems((prev) => prev.filter((x) => x.id !== id)),
    addWRow: (r) => setWRows((prev) => [...prev, { ...r, id: uid("wr") }]),
    updateWRow: (id, patch) => setWRows((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeWRow: (id) => setWRows((prev) => prev.filter((x) => x.id !== id)),
    seedWorkCells: () => {
      const R = (shift: ShiftId, staff: string, alloc: string, inventory: string, task: string): WorkRow =>
        ({ id: uid("wr"), shift, staff, alloc, inventory, task });
      setWRows([
        R("morning", "RN ANOOSHA", "Shift Incharge", "Narcotics", "Fridge Temp"),
        R("morning", "SRN SHAZRA", "Bed 2 + 1st Adm", "-", "ICP"),
        R("morning", "SRN MAUVA", "Bed 3 + HD", "Daily", "-"),
      ]);
    },
    admit: (bedNo, p) => {
      const stayId = uid("stay");
      const now = new Date().toISOString();
      const patient: Patient = { ...p, id: uid("pt"), stayId, bedNo, admittedAt: now };
      setPatients((prev) => ({ ...prev, [bedNo]: patient }));
      setRegistry((prev) => ({ ...prev, [patient.hospitalNo]: entryFor(patient, now) }));
      // Returning patient: carry forward Demographics + Background only, so history
      // stays continuous. Assessment / Recommendation / Safety start fresh.
      // The copy is a normal editable draft for the new stay.
      const dc = discharges
        .filter((d) => d.hospitalNo === patient.hospitalNo)
        .sort((a, b) => (a.datetime < b.datetime ? 1 : -1))[0];
      const ho = handovers
        .filter((h) => h.hospitalNo === patient.hospitalNo)
        .sort((a, b) => (a.datetime < b.datetime ? 1 : -1))[0];
      const base: SBARData | null =
        (dc && sbarByStay[dc.stayId]) ? sbarByStay[dc.stayId] :
        ho ? ho.snapshot : null;
      const fresh: SBARData = emptySBAR({});
      if (base) {
        const carry: (keyof SBARData)[] = [
          "patientName", "hospitalNo", "ageSex", "admissionDateTime", "admissionTime",
          "correctIdBand", "selfIntroduction", "shiftType",
          "medSurgHistory", "obstetricHistory", "admissionContext", "investigations",
          "cultures", "radiology", "medications", "procedures", "consentsBg", "remarksBg",
        ];
        for (const k of carry) {
          const val = base[k] as unknown;
          if (val !== undefined) (fresh as unknown as Record<string, unknown>)[k as string] = val;
        }
      }
      setSbarByStay((prev) => ({
        ...prev,
        [stayId]: {
          ...fresh,
          patientName: patient.name, hospitalNo: patient.hospitalNo, wardBedNo: bedNo,
          ageSex: `${patient.age}/${patient.sex}`, presentDiagnosis: patient.diagnosis,
          date: now.slice(0, 10),
          newShiftHandover: true, transferHandover: false,
          handoverGivenBy: activeStaff, givenSign: "",
          handoverReceivedBy: "", receivedSign: "",
        },
      }));
    },
    discharge: (bedNo) => {
      setPatients((prev) => {
        const next = { ...prev };
        delete next[bedNo];
        return next;
      });
    },
    dischargePatient: (bedNo, outcome, note) => {
      const p = patients[bedNo];
      if (!p) return;
      const now = new Date().toISOString();
      const rec: DischargeRecord = {
        id: uid("dc"), bedNo, patientName: p.name, hospitalNo: p.hospitalNo,
        age: p.age, sex: p.sex, diagnosis: p.diagnosis, category: p.category, specialty: p.specialty,
        outcome, note: note || "", datetime: now, admittedAt: p.admittedAt, stayId: p.stayId, recordedBy: activeStaff,
      };
      setDischarges((prev) => [rec, ...prev]);
      setRegistry((prev) => ({ ...prev, [p.hospitalNo]: entryFor(p, now) }));
      setPatients((prev) => {
        const next = { ...prev };
        delete next[bedNo];
        return next;
      });
    },
    updatePatient: (bedNo, patch) => setPatients((prev) => prev[bedNo] ? { ...prev, [bedNo]: { ...prev[bedNo], ...patch } } : prev),
    getSBAR: (stayId) => ({ ...emptySBAR(), ...(sbarByStay[stayId] ?? {}) }),
    saveSBAR: (stayId, data) => setSbarByStay((prev) => ({ ...prev, [stayId]: data })),
    submitHandover: (stayId, data) => {
      const rec: HandoverRecord = {
        id: uid("ho"), stayId, bedNo: (data.wardBedNo || "Bed 1") as BedNo,
        patientName: data.patientName, hospitalNo: data.hospitalNo,
        shiftType: data.shiftType || "Morning",
        givenBy: data.handoverGivenBy, receivedBy: data.handoverReceivedBy,
        datetime: new Date().toISOString(), snapshot: { ...data },
      };
      setSbarByStay((prev) => ({ ...prev, [stayId]: { ...data } }));
      setHandovers((prev) => [rec, ...prev]);
      return rec;
    },
    handoversForStay: (stayId) => handovers.filter((h) => h.stayId === stayId),
    seed: () => {
      const p = seedPatients();
      const now = new Date().toISOString();
      const reg: Record<string, RegistryEntry> = {};
      for (const b of Object.keys(p)) reg[p[b].hospitalNo] = entryFor(p[b], now);
      setPatients(p);
      setRegistry(reg);
      setSbarByStay(seedSBAR(p));
      setHandovers([]);
      setDischarges([]);
    },
    resetAll: () => { setPatients({}); setSbarByStay({}); setHandovers([]); setDischarges([]); setRegistry({}); },
  }), [patients, sbarByStay, handovers, discharges, registry, wItems, wRows, activeStaff]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWard(): WardState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWard must be used inside WardProvider");
  return ctx;
}

export { ALL_BEDS };
