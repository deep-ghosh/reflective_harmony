// lib/utils.ts - Tailwind class merger
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// format a date as a relative "time ago" string (e.g. "2 hours ago")
export function formatTimeAgo(date?: string | Date | null) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "-";

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let counter = seconds;
  for (let i = 0; i < intervals.length; i++) {
    const [factor, unit] = intervals[i];
    if (counter < factor) {
      const value = Math.max(1, Math.floor(counter));
      return `${value} ${unit}${value !== 1 ? "s" : ""} ago`;
    }
    counter = Math.floor(counter / factor);
  }

  return d.toLocaleString();
}
