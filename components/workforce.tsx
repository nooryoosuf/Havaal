"use client";

import { useId, useState } from "react";
import { CalendarDays, Check, Moon, MoreVertical, Pencil, Plus, Sparkles, Sun, Sunrise, Trash2, X } from "lucide-react";
import { useWard } from "@/lib/store";
import { SHIFTS, STAFF_LIST, WORK_COLS, ShiftId, WorkCellItem, WorkCol, WorkRow, currentShift } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/inputs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowCard } from "@/components/aceternity/glow-card";
import { StaffAvatar } from "@/components/staff-avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

const SHIFT_ICON = {
  morning: { Icon: Sunrise, cls: "text-red-500" },
  afternoon: { Icon: Sun, cls: "text-orange-500" },
  night: { Icon: Moon, cls: "text-indigo-400" },
} as const;

function CellList({ shift, col }: { shift: ShiftId; col: WorkCol }) {
  const ward = useWard();
  const items = ward.wItems.filter((i) => i.shift === shift && i.col === col);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const dlId = useId();
  const suggestions = col === "staff"
    ? Array.from(new Set([...STAFF_LIST, ...ward.wItems
        .filter((i) => i.col === "staff" || i.col === "mo" || i.col === "attendant")
        .map((i) => i.text.trim()).filter(Boolean)]))
    : [];

  const saveNew = () => {
    const t = draft.trim();
    if (!t) return;
    ward.addWItem({ shift, col, text: t });
    setDraft("");
    setAdding(false);
  };
  const saveEdit = () => {
    const t = editText.trim();
    if (!editingId) return;
    if (!t) ward.removeWItem(editingId);
    else ward.updateWItem(editingId, { text: t });
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="flex min-h-[96px] flex-col gap-1.5">
      {col === "staff" && (
        <datalist id={dlId}>{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
      )}
      {items.length === 0 && !adding && <span className="text-xs text-slate-400">—</span>}
      {items.map((it: WorkCellItem) =>
        editingId === it.id ? (
          <span key={it.id} className="flex items-center gap-1">
            <Input
              autoFocus value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
              list={col === "staff" ? dlId : undefined}
              className="h-7 bg-white text-xs dark:bg-slate-900" aria-label="Edit entry"
            />
            <button type="button" aria-label="Save" onClick={saveEdit} className="rounded p-1 text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/50"><Check className="h-3.5 w-3.5" /></button>
            <button type="button" aria-label="Cancel" onClick={() => setEditingId(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /></button>
          </span>
        ) : (
          <span key={it.id} className="group flex items-start gap-1 text-sm leading-snug">
            <span className="min-w-0 flex-1">{it.text}</span>
            <span className="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
              <button type="button" aria-label={`Edit "${it.text}"`} onClick={() => { setEditingId(it.id); setEditText(it.text); }} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"><Pencil className="h-3 w-3" /></button>
              <button type="button" aria-label={`Delete "${it.text}"`} onClick={() => ward.removeWItem(it.id)} className="rounded p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
              </span>
          </span>
        )
      )}
      {adding ? (
        <span className="flex items-center gap-1">
          <Input
            autoFocus value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveNew(); if (e.key === "Escape") { setAdding(false); setDraft(""); } }}
            placeholder="New entry…"
            list={col === "staff" ? dlId : undefined}
            className="h-7 bg-white text-xs dark:bg-slate-900" aria-label="New entry"
          />
          <button type="button" aria-label="Save" onClick={saveNew} className="rounded p-1 text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/50"><Check className="h-3.5 w-3.5" /></button>
          <button type="button" aria-label="Cancel" onClick={() => { setAdding(false); setDraft(""); }} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /></button>
        </span>
      ) : (
        <button type="button" onClick={() => setAdding(true)}
          className="mt-auto w-full rounded-lg border border-dashed border-slate-300 bg-white/60 p-1.5 text-xs text-slate-400 transition-colors hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-cyan-500 dark:hover:text-cyan-400">
          + Add
        </button>
      )}
    </div>
  );
}

const ALLOC_OPTIONS = [
  "Shift Incharge",
  "Ward Manager",
  ...Array.from({ length: 9 }, (_, i) => `Bed ${i + 1}`),
  "1st Adm", "2nd Adm", "3rd Adm", "4th Adm",
  "HD", "ISO",
];

const INV_OPTIONS = ["-", "ET 1", "ET 2", "Daily", "Narcotics"];

const TASK_OPTIONS = ["-", "Fridge Temp", "Trolley Refill", "ICP"];

function matchAlloc(text: string): string[] {
  const t = text.toLowerCase();
  return ALLOC_OPTIONS.filter((o) => t.includes(o.toLowerCase()));
}

function AllocPicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) => {
    if (selected.includes(o)) onChange(selected.filter((x) => x !== o));
    else if (selected.length < 2) onChange([...selected, o]);
  };
  return (
    <span className="flex flex-col gap-1.5">
      <span className="flex flex-wrap gap-1.5">
        {ALLOC_OPTIONS.map((o) => {
          const on = selected.includes(o);
          const locked = !on && selected.length >= 2;
          return (
            <button key={o} type="button" disabled={locked} title={locked ? "Maximum 2 selected" : o} onClick={() => toggle(o)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${on ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-200 bg-white hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900"} ${locked ? "cursor-not-allowed opacity-40" : ""}`}>
              {o}
            </button>
          );
        })}
      </span>
      <span className="text-[11px] text-slate-400">{selected.length}/2 selected{selected.length >= 2 ? " — max reached" : ""}</span>
    </span>
  );
}

function RowEditor({ shift, editing, names, onClose }: {
  shift: ShiftId; editing?: WorkRow; names: string[]; onClose: () => void;
}) {
  const ward = useWard();
  const [staff, setStaff] = useState(editing ? editing.staff : "");
  const [allocSel, setAllocSel] = useState<string[]>(function () { return matchAlloc(editing ? editing.alloc : ""); });
  const [touchedAlloc, setTouchedAlloc] = useState(false);
  const [inv, setInv] = useState(editing && INV_OPTIONS.indexOf(editing.inventory) >= 0 ? editing.inventory : "");
  const [touchedInv, setTouchedInv] = useState(false);
  const [task, setTask] = useState(editing && TASK_OPTIONS.indexOf(editing.task) ? editing.task : "");
  const [touchedTask, setTouchedTask] = useState(false);
  const dlId = useId();
  const save = function (next: boolean) {
    const name = staff.trim();
    if (!name) return;
    const row = {
      shift: shift,
      staff: name,
      alloc: touchedAlloc ? allocSel.join(" + ") : (editing ? editing.alloc : ""),
      inventory: touchedInv ? inv : (editing ? editing.inventory : ""),
      task: touchedTask ? task : (editing ? editing.task : ""),
    };
    if (editing) ward.updateWRow(editing.id, row);
    else ward.addWRow(row);
    if (next) {
      setStaff(""); setAllocSel([]); setTouchedAlloc(false);
      setInv(""); setTouchedInv(false); setTask(""); setTouchedTask(false);
    } else onClose();
  };
  return (
    <Dialog open onOpenChange={function (v) { if (!v) onClose(); }}>
      <div className="mx-auto max-w-lg">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle>{editing ? "Edit staff row" : "Add staff row"}</DialogTitle>
          <DialogDescription>1 · Staff → 2 · Allocation → 3 · Inventory → 4 · Task</DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1"><Label htmlFor="wr-staff">1 · Staff</Label>
              <Input id="wr-staff" list={dlId} value={staff} onChange={function (e) { setStaff(e.target.value); }} placeholder="Select or type a name" />
              <datalist id={dlId}>{names.map(function (n) { return <option key={n} value={n} />; })}</datalist>
            </div>
            <div className="flex flex-col gap-1"><Label>2 · Allocation (up to 2)</Label>
              <AllocPicker selected={allocSel} onChange={function (v) { setAllocSel(v); setTouchedAlloc(true); }} />
              {!touchedAlloc && editing && editing.alloc && matchAlloc(editing.alloc).length === 0 && (
                <p className="text-[11px] text-slate-400">Current: {editing.alloc}</p>
              )}
            </div>
            <div className="flex flex-col gap-1"><Label htmlFor="wr-inv">3 · Inventory</Label>
              <Select id="wr-inv" value={inv} onChange={function (e) { setInv(e.target.value); setTouchedInv(true); }}>
                <option value="" disabled>Select…</option>
                {INV_OPTIONS.map(function (o) { return <option key={o} value={o}>{o}</option>; })}
                {editing && editing.inventory && INV_OPTIONS.indexOf(editing.inventory) < 0 && (
                  <option value={editing.inventory}>{editing.inventory} (custom)</option>
                )}
              </Select>
              {!touchedInv && editing && editing.inventory && INV_OPTIONS.indexOf(editing.inventory) < 0 && (
                <p className="text-[11px] text-slate-400">Current: {editing.inventory}</p>
              )}
            </div>
            <div className="flex flex-col gap-1"><Label htmlFor="wr-task">4 · Task</Label>
              <Select id="wr-task" value={task} onChange={function (e) { setTask(e.target.value); setTouchedTask(true); }}>
                <option value="" disabled>Select…</option>
                {TASK_OPTIONS.map(function (o) { return <option key={o} value={o}>{o}</option>; })}
                {editing && editing.task && TASK_OPTIONS.indexOf(editing.task) < 0 && (
                  <option value={editing.task}>{editing.task} (custom)</option>
                )}
              </Select>
              {!touchedTask && editing && editing.task && TASK_OPTIONS.indexOf(editing.task) < 0 && (
                <p className="text-[11px] text-slate-400">Current: {editing.task}</p>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          {editing && (
            <Button variant="destructive" className="sm:mr-auto" onClick={() => { if (confirm(`Delete the row for ${editing.staff}?`)) { ward.removeWRow(editing.id); onClose(); } }}>
              <Trash2 /> Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="outline" disabled={!staff.trim()} onClick={function () { save(true); }}><Plus /> Save &amp; next</Button>
          <Button disabled={!staff.trim()} onClick={function () { save(false); }}>Save</Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}

export default function Workforce() {
  const ward = useWard();
  const now = currentShift();
  const [rowDlg, setRowDlg] = useState<{ shift: ShiftId; editing?: WorkRow } | null>(null);
  const [menuShift, setMenuShift] = useState<ShiftId | null>(null);
  const empty = ward.wRows.length === 0;
  const names = Array.from(new Set([...STAFF_LIST, ...ward.wRows.map((r) => r.staff.trim()).filter(Boolean)]));
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-4 w-4" /> {today}
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
          Now: {SHIFTS.find((s) => s.id === now)?.label}
        </span>
        {empty && (
          <Button size="sm" variant="secondary" className="ml-auto" onClick={ward.seedWorkCells}><Sparkles /> Demo board</Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {SHIFTS.map((s, si) => {
          const rows = ward.wRows.filter((r) => r.shift === s.id);
          return (
          <GlowCard key={s.id} className="animate-fade-up" style={{ animationDelay: `${si * 70}ms` }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {(() => {
                    const { Icon, cls } = SHIFT_ICON[s.id];
                    return <Icon className={"h-5 w-5 " + cls} />;
                  })()}
                  {s.label}
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.timing}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    {s.id === now && (
                      <Badge variant="default">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Now
                      </Badge>
                    )}
                    {menuShift === s.id && (
                      <Button size="icon" variant="outline" aria-label={"Add staff row to " + s.label} onClick={() => setRowDlg({ shift: s.id })}><Plus /></Button>
                    )}
                    <Button size="icon" variant={menuShift === s.id ? "default" : "outline"} aria-label="Row actions" aria-expanded={menuShift === s.id} onClick={() => setMenuShift((m) => (m === s.id ? null : s.id))}><MoreVertical /></Button>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 min-[1500px]:grid-cols-5">
                <div className="min-w-0 min-[1500px]:col-span-3">
                  <div className="mb-1 hidden grid-cols-[180px_1fr_1fr_1fr_auto] gap-2 px-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:grid dark:text-slate-400">
                    <span>Staff</span><span>Allocations</span><span>Inventory</span><span>Task</span><span><span className="sr-only">Actions</span></span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {rows.map((r) => (
                      <div key={r.id} className="grid gap-1.5 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:grid-cols-[180px_1fr_1fr_1fr_auto] sm:items-center sm:gap-2">
                        <div className="min-w-0">
                          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:hidden">Staff</p>
                          <span className="flex items-center gap-2 font-semibold"><StaffAvatar name={r.staff} size="sm" /><span className="truncate">{r.staff}</span></span>
                        </div>
                        <div className="min-w-0">
                          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:hidden">Allocations</p>
                          <span className="text-sm">{r.alloc || <span className="text-slate-400">—</span>}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:hidden">Inventory</p>
                          <span className="text-sm">{r.inventory || <span className="text-slate-400">—</span>}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:hidden">Task</p>
                          <span className="text-sm">{r.task || <span className="text-slate-400">—</span>}</span>
                        </div>
                        {menuShift === s.id && (
                          <div className="flex gap-1 sm:justify-end">
                          <Button size="icon" variant="ghost" aria-label={"Edit row for " + r.staff} onClick={() => setRowDlg({ shift: s.id, editing: r })}><Pencil /></Button>
                          <Button size="icon" variant="ghost" aria-label={"Delete row for " + r.staff} className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50" onClick={() => { if (confirm("Delete this staff row?")) ward.removeWRow(r.id); }}><Trash2 /></Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {rows.length === 0 && (
                    <p className="p-2 text-sm text-slate-500 dark:text-slate-400">No staff rows yet — press + above to add the first row.</p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-900/40 min-[1500px]:col-span-2">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {WORK_COLS.slice(4).map((c) => (
                      <div key={c.id}>
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">{c.label}</p>
                        <CellList shift={s.id} col={c.id} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlowCard>
          );
        })}
      </div>
      {rowDlg && (
        <RowEditor key={rowDlg.editing ? rowDlg.editing.id : "new-" + rowDlg.shift} shift={rowDlg.shift} editing={rowDlg.editing} names={names} onClose={() => setRowDlg(null)} />
      )}
    </div>
  );
}
