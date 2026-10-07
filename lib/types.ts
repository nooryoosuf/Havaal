export const BED_ORDER_LEFT = ["Bed 1", "Bed 3", "Bed 5", "Bed 7", "Bed 9"] as const;
export const BED_ORDER_RIGHT = ["Bed 2", "Bed 4", "Bed 6", "Bed 8", "Isolation Bed"] as const;
export const ALL_BEDS = [...BED_ORDER_LEFT, ...BED_ORDER_RIGHT] as const;
export type BedNo = (typeof ALL_BEDS)[number];

export type Sex = "M" | "F" | "Other";

export interface Patient {
  id: string;
  bedNo: BedNo;
  name: string;
  age: string;
  sex: Sex;
  hospitalNo: string;
  diagnosis: string;
  category: string; // admission category — uses the specialty list
  specialty: string; // dashboard display only — never printed or added to SBAR
  tags: string[];
  admittedAt: string; // ISO
  stayId: string;
}

export interface SBARData {
  // Demographics / header
  patientName: string;
  hospitalNo: string;
  wardBedNo: string;
  date: string;
  ageSex: string;
  admissionDateTime: string;
  admissionTime: string;
  newShiftHandover: boolean;
  transferHandover: boolean;
  correctIdBand: boolean;
  selfIntroduction: boolean;
  handoverGivenBy: string;
  givenSign: string;
  handoverReceivedBy: string;
  receivedSign: string;
  // Situation
  dayOfAdmission: string;
  pod: string;
  codeStatus: string;
  presentDiagnosis: string;
  currentClinicalStatus: string;
  presentTreatment: string;
  weight: string;
  bloodGroup: string;
  allergies: string;
  // Background
  medSurgHistory: string;
  obstetricHistory: string;
  admissionContext: string;
  investigations: string;
  cultures: string;
  radiology: string;
  medications: string;
  procedures: string;
  consentsBg: string;
  remarksBg: string;
  // Assessment - present condition
  gcsE: string;
  gcsV: string;
  gcsM: string;
  rass: string;
  muscleStrength: string;
  pupils: string;
  hemodynamicStatus: string;
  sysBP: string;
  diaBP: string;
  spo2: string;
  ventMode: string;
  etSize: string;
  etPosition: string;
  ventSettings: string;
  // Lines / drains / skin
  invasiveAccess: string;
  invasivePatency: string;
  peripheralAccess: string;
  peripheralPatency: string;
  vipScore: string;
  drainStatus: string;
  woundStatus: string;
  bradenScore: string;
  // GI / Urinary
  feedDetail: string;
  intake: string;
  output: string;
  bloodTransfusion: string;
  grvEmesis: string;
  hdStatus: string;
  uf: string;
  fluidRestriction: string;
  stool: string;
  remarksAssess: string;
  // Recommendation
  priorityActions: string;
  routineActions: string;
  pendingReports: string;
  pendingReferrals: string;
  consentsRec: string;
  familyUpdate: string;
  remarksRec: string;
  // Safety
  restraints: boolean;
  mobilityStatus: string;
  equipmentInjury: string;
  psychWellbeing: string;
  ipcUniversal: boolean;
  ipcStandard: boolean;
  ipcIsolated: boolean;
  ipcRemarks: string;
  fallRisk: boolean;
  deliriumRisk: boolean;
  incident: boolean;
  safetyRemarks: string;
  shiftType: string;
}

export interface HandoverRecord {
  id: string;
  stayId: string;
  bedNo: BedNo;
  patientName: string;
  hospitalNo: string;
  shiftType: string;
  givenBy: string;
  receivedBy: string;
  datetime: string; // ISO
  snapshot: SBARData;
}

export type DischargeOutcome = "Shifted out" | "Discharged" | "Death";

export const DISCHARGE_OUTCOMES: DischargeOutcome[] = ["Shifted out", "Discharged", "Death"];

export interface DischargeRecord {
  id: string;
  bedNo: BedNo;
  patientName: string;
  hospitalNo: string;
  age: string;
  sex: Sex;
  diagnosis: string;
  category: Patient["category"];
  specialty: string;
  outcome: DischargeOutcome;
  note: string;
  datetime: string; // ISO — when the outcome was recorded
  admittedAt: string; // ISO — when this stay began
  stayId: string;
  recordedBy: string;
}

export interface RegistryEntry {
  hospitalNo: string;
  name: string;
  age: string;
  sex: Sex;
  diagnosis: string;
  category: Patient["category"];
  specialty: string;
  updatedAt: string; // ISO
}

export const SPECIALTIES = [
  "Internal Medicine",
  "Pediatrics",
  "General Surgery",
  "Obstetrics & Gynecology",
  "Cardiology",
  "Neurology",
  "Neurosurgery",
  "Pulmonology",
  "Psychiatry",
  "Other",
] as const;

export const TAG_OPTIONS = [
  "Ventilated",
  "Non-invasive",
  "Isolated",
  "High Fall Risk",
  "Delirium Risk",
  "Central Line",
  "Dialysis",
  "Post-op",
] as const;

export const STAFF_LIST = [
  "SRN SHAZRA",
  "SRN MAUVA",
  "SRN RISHANA",
  "RN SANA",
  "RN AINEEZ",
  "RN NAJEEB",
  "RN HUDHA",
  "RN MALSA",
  "RN NOORA",
  "RN HAMMAD",
  "RN RIFA",
  "RN NASHEETHA",
  "RN NAEELA",
  "RN SHIFRA",
  "RN VISHAAH",
  "RN SHEENAZ",
  "RN RAAYA",
  "RN SHAISHA",
  "RN LAILA",
  "RN SAN'AA",
  "RN ANOOSHA",
  "RN EEFA",
  "RN MUSAB",
] as unknown as string[];

export function emptySBAR(overrides: Partial<SBARData> = {}): SBARData {
  return {
    patientName: "",
    hospitalNo: "",
    wardBedNo: "",
    date: new Date().toISOString().slice(0, 10),
    ageSex: "",
    admissionDateTime: "",
    admissionTime: "",
    newShiftHandover: true,
    transferHandover: false,
    correctIdBand: false,
    selfIntroduction: false,
    handoverGivenBy: "",
    givenSign: "",
    handoverReceivedBy: "",
    receivedSign: "",
    dayOfAdmission: "",
    pod: "",
    codeStatus: "",
    presentDiagnosis: "",
    currentClinicalStatus: "",
    presentTreatment: "",
    weight: "",
    bloodGroup: "",
    allergies: "",
    medSurgHistory: "",
    obstetricHistory: "",
    admissionContext: "",
    investigations: "",
    cultures: "",
    radiology: "",
    medications: "",
    procedures: "",
    consentsBg: "",
    remarksBg: "",
    gcsE: "",
    gcsV: "",
    gcsM: "",
    rass: "",
    muscleStrength: "",
    pupils: "",
    hemodynamicStatus: "",
    sysBP: "",
    diaBP: "",
    spo2: "",
    ventMode: "",
    etSize: "",
    etPosition: "",
    ventSettings: "",
    invasiveAccess: "",
    invasivePatency: "",
    peripheralAccess: "",
    peripheralPatency: "",
    vipScore: "",
    drainStatus: "",
    woundStatus: "",
    bradenScore: "",
    feedDetail: "",
    intake: "",
    output: "",
    bloodTransfusion: "",
    grvEmesis: "",
    hdStatus: "",
    uf: "",
    fluidRestriction: "",
    stool: "",
    remarksAssess: "",
    priorityActions: "",
    routineActions: "",
    pendingReports: "",
    pendingReferrals: "",
    consentsRec: "",
    familyUpdate: "",
    remarksRec: "",
    restraints: false,
    mobilityStatus: "",
    equipmentInjury: "",
    psychWellbeing: "",
    ipcUniversal: false,
    ipcStandard: false,
    ipcIsolated: false,
    ipcRemarks: "",
    fallRisk: false,
    deliriumRisk: false,
    incident: false,
    safetyRemarks: "",
    shiftType: "Morning",
    ...overrides,
  };
}

export function gcsTotal(s: SBARData): number | null {
  const e = parseInt(s.gcsE, 10);
  const v = parseInt(s.gcsV, 10);
  const m = parseInt(s.gcsM, 10);
  if ([e, v, m].some((n) => Number.isNaN(n))) return null;
  return e + v + m;
}

export function mapValue(s: SBARData): number | null {
  const sys = parseFloat(s.sysBP);
  const dia = parseFloat(s.diaBP);
  if (Number.isNaN(sys) || Number.isNaN(dia)) return null;
  return Math.round((sys + 2 * dia) / 3);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
