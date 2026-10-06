import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ value, onValueChange, children, className }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return <div className={className} data-tabs={value}>{React.Children.map(children, (c) => React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<any>, { __value: value, __onChange: onValueChange }) : c)}</div>;
}
export function TabsList({ children, className, __value, __onChange }: any) {
  return <div className={cn("inline-flex flex-wrap gap-2", className)}>{React.Children.map(children, (c) => React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<any>, { __value, __onChange }) : c)}</div>;
}
export function TabsTrigger({ value, children, className, __value, __onChange }: any) {
  const active = __value === value;
  return <button type="button" onClick={() => __onChange(value)} className={cn("inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all", active ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100", className)}>{children}</button>;
}
export function TabsContent({ value, children, className, __value }: any) {
  if (__value !== value) return null;
  return <div className={cn("mt-3", className)}>{children}</div>;
}

export function Accordion({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("divide-y divide-slate-200 rounded-md border dark:divide-slate-800 dark:border-slate-800", className)}>{children}</div>;
}
export function AccordionItem({ title, children, defaultOpen }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between bg-slate-50 px-4 py-2.5 text-left text-sm font-semibold hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800">
        <span>{title}</span><span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

export function Table({ className, ...p }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <div className="w-full overflow-auto rounded-md border dark:border-slate-800 dark:bg-slate-900"><table className={cn("w-full caption-bottom text-sm", className)} {...p} /></div>;
}
export function THead(p: React.HTMLAttributes<HTMLTableSectionElement>) { return <thead className="[&_tr]:border-b dark:[&_tr]:border-slate-800" {...p} />; }
export function TBody(p: React.HTMLAttributes<HTMLTableSectionElement>) { return <tbody className="[&_tr:last-child]:border-0" {...p} />; }
export function TR(p: React.HTMLAttributes<HTMLTableRowElement>) { return <tr className="border-b transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50" {...p} />; }
export function TH({ className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) { return <th scope="col" className={cn("h-10 px-3 text-left align-middle font-medium text-slate-500 text-xs uppercase dark:text-slate-400", className)} {...p} />; }
export function TD({ className, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("p-3 align-middle", className)} {...p} />; }
