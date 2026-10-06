"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ALL_BEDS, BedNo, DischargeOutcome, DischargeRecord, HandoverRecord, Patient, RegistryEntry, SBARData, STAFF_LIST, emptySBAR, uid } from "@/lib/types";

interface WardState {
  patients: Record<string, Patient>; // keyed by bedNo
  sbarByStay: Record<string, SBARData>; // keyed by stayId
  handovers: HandoverRecord[];
  discharges: DischargeRecord[];
  registry: Record<string, RegistryEntry>; // keyed by hospitalNo — returning patients
  activeStaff: string;
  setActiveStaff: (s: string) => void;
  admit: (bedNo: BedNo, p: Omit<Patient, "id" | "stayId" | "admittedAt" | "bedNo">) => void;
  discharge: (bedNo: BedNo) => void;
  dischargePatient: (bedNo: BedNo, outcome: DischargeOutcome, note: string) => void;
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
        setActiveStaff(parsed.activeStaff ?? STAFF_LIST[0]);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ patients, sbarByStay, handovers, discharges, registry, activeStaff }));
  }, [patients, sbarByStay, handovers, discharges, registry, activeStaff, loaded]);

  const value = useMemo<WardState>(() => ({
    patients, sbarByStay, handovers, discharges, registry, activeStaff, setActiveStaff,
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
  }), [patients, sbarByStay, handovers, discharges, registry, activeStaff]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWard(): WardState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWard must be used inside WardProvider");
  return ctx;
}

export { ALL_BEDS };
