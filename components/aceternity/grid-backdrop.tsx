"use client";

import { cn } from "@/lib/utils";

// Inspired by Aceternity UI "Grid and Dot Backgrounds" + "Spotlight":
// a subtle blueprint grid with a cyan spotlight glow at the top. Screen only.
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("no-print pointer-events-none fixed inset-0", className)}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b14_1px,transparent_1px),linear-gradient(to_bottom,#64748b14_1px,transparent_1px)] bg-[size:28px_28px] dark:bg-[linear-gradient(to_right,#94a3b814_1px,transparent_1px),linear-gradient(to_bottom,#94a3b814_1px,transparent_1px)]" />
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(34,211,238,0.16),transparent_70%)] dark:bg-[radial-gradient(60%_100%_at_50%_0%,rgba(34,211,238,0.12),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-100 to-transparent dark:from-slate-950" />
    </div>
  );
}
