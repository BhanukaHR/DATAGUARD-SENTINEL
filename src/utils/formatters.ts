import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

/** Converts any date-like value (JS Date, ISO string, Firestore Timestamp) to a JS Date */
export function toDate(input: unknown): Date | null {
  if (!input) return null;
  // Firestore Timestamp — has toDate()
  if (typeof (input as { toDate?: unknown }).toDate === "function") {
    return (input as { toDate: () => Date }).toDate();
  }
  // Firestore Timestamp-like plain object — has .seconds
  if (typeof input === "object" && typeof (input as { seconds?: unknown }).seconds === "number") {
    return new Date((input as { seconds: number }).seconds * 1000);
  }
  // ISO string
  if (typeof input === "string") {
    const d = parseISO(input);
    return isValid(d) ? d : null;
  }
  // Already a Date
  if (input instanceof Date) return isValid(input) ? input : null;
  return null;
}

export function formatDate(dateInput: unknown): string {
  const d = toDate(dateInput);
  if (!d) return "—";
  return format(d, "MMM d, yyyy HH:mm");
}

export function formatShortDate(dateInput: unknown): string {
  const d = toDate(dateInput);
  if (!d) return "—";
  return format(d, "MMM d, yyyy");
}

export function formatTimeAgo(dateInput: unknown): string {
  const d = toDate(dateInput);
  if (!d) return "—";
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
