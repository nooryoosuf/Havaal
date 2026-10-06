"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Inspired by Aceternity UI "Glowing Effect" (as seen on Cursor):
// a cyan gradient border glow that fades in on hover. Wraps any card.
export function GlowCard({ children, className, glowClassName, style }: {
  children: React.ReactNode;
  className?: string;
  glowClassName?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -400, y: -400 });
  const [on, setOn] = useState(false);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      className={cn("group/glow relative rounded-xl", className)}
      style={style}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl blur-[6px] transition-opacity duration-500",
          glowClassName ?? "bg-[radial-gradient(240px_circle_at_var(--gx)_var(--gy),rgba(34,211,238,0.55),rgba(34,211,238,0.12)_45%,transparent_70%)]"
        )}
        style={{ opacity: on ? 1 : 0, ["--gx" as string]: `${pos.x}px`, ["--gy" as string]: `${pos.y}px` } as React.CSSProperties}
      />
      <div className="relative h-full rounded-[11px]">{children}</div>
    </div>
  );
}
