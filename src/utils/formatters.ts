import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function formatDate(dateInput: Date | string | undefined | null): string {
  if (!dateInput) return "—";
  const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy HH:mm");
}

export function formatShortDate(dateInput: Date | string | undefined | null): string {
  if (!dateInput) return "—";
  const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy");
}

export function formatTimeAgo(dateInput: Date | string | undefined | null): string {
  if (!dateInput) return "—";
  const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function levelFromBRS(brs: number): "Low" | "Medium" | "High" | "Critical" {
  if (brs >= 85) return "Critical";
  if (brs >= 60) return "High";
  if (brs >= 30) return "Medium";
  return "Low";
}

export function isoNowMinus(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}
