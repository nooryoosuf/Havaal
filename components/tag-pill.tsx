"use client";

import {
  AlertTriangle, Bandage, Brain, Droplets, RefreshCw,
  ShieldAlert, Tag, Waves, Wind, type LucideIcon,
} from "lucide-react";

const MAP: Array<[RegExp, LucideIcon]> = [
  [/ventilat/i, Wind],
  [/non-invasive|niv/i, Waves],
  [/isolat/i, ShieldAlert],
  [/fall/i, AlertTriangle],
  [/delirium/i, Brain],
  [/central|line/i, Droplets],
  [/dialysis|hd\b/i, RefreshCw],
  [/post-?op/i, Bandage],
];

export function tagIcon(tag: string): LucideIcon {
  for (const [re, Icon] of MAP) if (re.test(tag)) return Icon;
  return Tag;
}
