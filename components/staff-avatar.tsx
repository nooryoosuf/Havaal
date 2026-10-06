"use client";

import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-cyan-500",
  "from-sky-500 to-emerald-500",
] as const;

const RANKS = new Set([
  "SRN", "RN", "MO", "DR", "CN", "EN", "STAFF", "NURSE", "NURSES",
  "MEDICAL", "OFFICER", "CHARGE", "SENIOR", "REGISTERED",
]);

export function staffInitials(name: string): string {
  const afterDash = name.includes("—") ? (name.split("—").pop() ?? name) : name;
  let words = afterDash.trim().split(/\s+/).filter(Boolean);
  while (words.length > 1 && RANKS.has(words[0].replace(/[^A-Za-z]/g, "").toUpperCase())) words = words.slice(1);
  const clean = (w: string) => w.replace(/[^A-Za-z]/g, "") || "?";
  const first = clean(words[0] ?? "?").charAt(0).toUpperCase();
  const last = words.length > 1 ? clean(words[words.length - 1]).charAt(0).toUpperCase() : "";
  return first + last;
}

export function staffGradient(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export function staffRole(name: string): string {
  const parts = name.split("—");
  if (parts.length > 1) return parts[0].trim();
  const m = name.trim().match(/^(SRN|RN|MO|DR)\b/i);
  if (m) {
    const r = m[1].toUpperCase();
    if (r === "SRN") return "Senior Registered Nurse";
    if (r === "RN") return "Registered Nurse";
    if (r === "MO") return "Medical Officer";
    return "Doctor";
  }
  return "Staff";
}

export function StaffAvatar({ name, size = "md", active, onClick, title }: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  const dims = { xs: "h-5 w-5 text-[8px]", sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-11 w-11 text-sm" }[size];
  const cls = cn(
    "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white transition-all duration-200",
    dims, staffGradient(name),
    onClick && "cursor-pointer hover:scale-110 active:scale-95",
    active
      ? "ring-2 ring-cyan-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
      : onClick ? "ring-1 ring-black/10 hover:ring-2 hover:ring-cyan-400 dark:ring-white/10" : "ring-1 ring-black/10 dark:ring-white/10"
  );
  if (!onClick) return <span className={cls} title={title ?? name} aria-label={name}>{staffInitials(name)}</span>;
  return <button type="button" className={cls} title={title ?? name} aria-label={name} aria-pressed={!!active} onClick={onClick}>{staffInitials(name)}</button>;
}
