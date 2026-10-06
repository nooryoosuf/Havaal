import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
  React.useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onOpenChange]);
  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="animate-fade absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div role="dialog" aria-modal="true" className="animate-modal relative z-10 max-h-[90vh] w-full overflow-auto rounded-xl border bg-white dark:border-slate-700 dark:bg-slate-900">{children}</div>
    </div>
  );
}
export function DialogHeader({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-5 pb-2", className)} {...p} />;
}
export function DialogTitle({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...p} />;
}
export function DialogDescription({ className, ...p }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...p} />;
}
export function DialogContent({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-2", className)} {...p} />;
}
export function DialogFooter({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse gap-2 border-t p-4 dark:border-slate-700 sm:flex-row sm:justify-end [&>button]:w-full [&>button]:sm:w-auto", className)} {...p} />;
}
export function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} className="absolute right-3 top-3 rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Close">
      <X className="h-4 w-4" />
    </button>
  );
}
