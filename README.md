# ICU Handover & Bed Management System

Clinical ICU web application built with **Next.js (App Router)**, **Tailwind CSS**, **Lucide React**, and **shadcn/ui-style components**.

## Modules

1. **Spatial Bed Dashboard** (`/`) — two-column ward overview:
   - Left: Bed 1, 3, 5, 7, 9 · Right: Bed 2, 4, 6, 8, Isolation Bed.
   - Vacant = dashed border + green badge + *Admit Patient*; Occupied = solid border + demographics/tags + *Fill/Edit SBAR, Shift History, Print Form, Discharge*.
2. **Ward Statistics + Handover Archive** — occupancy, isolation status, acuity (vent/NIV, central lines, dialysis), safety flags (Braden < 12, fall/delirium), admission categories; immutable handover snapshots with View / Re-Print / Export JSON + CSV export.
3. **Interactive SBAR Form** — tabbed data entry with **GCS auto-sum (E+V+M)** and **MAP auto-calc ((Sys + 2×Dia)/3)**.
4. **Pixel-perfect 2-page print engine** — A4 bordered table grid, `text-[10px]`, black borders, `page-break-after: always` after Page 1, hospital header placeholder, `.no-print` hidden via `@media print`.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

State persists in `localStorage` (`icu-ward-v1`). Use **Demo data** in the header to load sample patients. Toggle the **Active user** (Staff Switcher) to auto-fill *Handover given by*.
