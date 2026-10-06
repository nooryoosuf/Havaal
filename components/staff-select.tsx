"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { STAFF_LIST } from "@/lib/types";
import { StaffAvatar, staffRole } from "@/components/staff-avatar";
import { cn } from "@/lib/utils";

export default function StaffSelect({ value, onChange, options = STAFF_LIST }: {
  value: string;
  onChange: (v: string) => void;
  options?: readonly string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...options];
    return options.filter((s) => s.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHi(Math.max(0, options.indexOf(value)));
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open, options, value]);

  useEffect(() => setHi(0), [query]);

  const pick = (s: string) => { onChange(s); setOpen(false); };

  return (
    <div ref={boxRef} className="static sm:relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white pl-1.5 pr-2.5 text-sm shadow-sm transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600">
        <StaffAvatar name={value} size="sm" />
        <span className="max-w-36 truncate text-left text-xs font-medium sm:max-w-48">{value}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div role="listbox" aria-label="Select active user"
            className="animate-modal absolute inset-x-4 top-full z-50 mt-2 flex max-h-80 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:inset-x-auto sm:right-0 sm:w-72">
            <div className="border-b border-slate-100 p-2 dark:border-slate-800">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(filtered.length - 1, h + 1)); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
                    else if (e.key === "Enter") { if (filtered[hi]) pick(filtered[hi]); }
                    else if (e.key === "Escape") setOpen(false);
                  }}
                  placeholder="Search staff…"
                  className="h-9 w-full rounded-lg border border-transparent bg-slate-100 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-900" />
              </div>
            </div>
            <div className="overflow-auto p-1.5">
              {filtered.length === 0 && (
                <p className="px-3 py-5 text-center text-xs text-slate-500 dark:text-slate-400">No staff match “{query.trim()}”.</p>
              )}
              {filtered.map((s, i) => (
                <button key={s} type="button" role="option" aria-selected={s === value}
                  onMouseEnter={() => setHi(i)}
                  onClick={() => pick(s)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors",
                    i === hi ? "bg-cyan-50 dark:bg-cyan-950/40" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}>
                  <StaffAvatar name={s} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s}</span>
                    <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{staffRole(s)}</span>
                  </span>
                  {s === value && <Check className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
