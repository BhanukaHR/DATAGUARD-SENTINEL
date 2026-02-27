import {
  collection, getDocs, query, where, orderBy, limit, startAfter,
  Timestamp, DocumentSnapshot, type QueryConstraint
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { UploadEvent } from "../types/upload-event";
import type { ClipboardEvent } from "../types/clipboard-event";
import type { RemovableMediaEvent } from "../types/removable-media-event";
import type { AiApplicationEvent } from "../types/ai-application-event";

export interface EventFilters {
  channel?: string;
  sensitivityLevel?: string;
  isBlocked?: boolean;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  minRiskScore?: number;
  maxRiskScore?: number;
}

function buildDateQuery(
  colName: string,
  dateField: string,
  filters: EventFilters,
  pageSize: number,
  lastDoc?: DocumentSnapshot
) {
  const constraints: QueryConstraint[] = [orderBy(dateField, "desc"), limit(pageSize + 1)];

  if (filters.startDate) {
    constraints.push(where(dateField, ">=", Timestamp.fromDate(filters.startDate)));
  }
  if (filters.endDate) {
    constraints.push(where(dateField, "<=", Timestamp.fromDate(filters.endDate)));
  }
  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  return query(collection(db, colName), ...constraints);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function clientFilter<T extends Record<string, any>>(docs: T[], filters: EventFilters): T[] {
  return docs.filter((d) => {
    if (filters.channel && d.channel !== filters.channel) return false;
    if (filters.sensitivityLevel && d.sensitivityLevel !== filters.sensitivityLevel) return false;
    if (filters.isBlocked !== undefined && d.isBlocked !== filters.isBlocked) return false;
    if (filters.userId && d.userId !== filters.userId && d.employeeId !== filters.userId) return false;
    if (filters.minRiskScore !== undefined) {
      const score = d.transactionRiskScore ?? d.riskScore ?? 0;
      if (score < filters.minRiskScore) return false;
    }
    if (filters.maxRiskScore !== undefined) {
      const score = d.transactionRiskScore ?? d.riskScore ?? 0;
      if (score > filters.maxRiskScore) return false;
    }
    return true;
  });
}

export const eventService = {
  async getUploadEvents(
    filters: EventFilters = {},
    pageSize = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ events: UploadEvent[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    const q = buildDateQuery("uploadEvents", "timestamp", filters, pageSize, lastDoc);
    const snapshot = await getDocs(q);
    let events = snapshot.docs.slice(0, pageSize).map((d) => ({
      eventId: d.id,
      ...d.data(),
    })) as UploadEvent[];

    events = clientFilter(events, filters);

    return {
      events,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[Math.min(pageSize - 1, snapshot.docs.length - 1)] : undefined,
      hasMore: snapshot.docs.length > pageSize,
    };
  },

  async getClipboardEvents(
    filters: EventFilters = {},
    pageSize = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ events: ClipboardEvent[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    const q = buildDateQuery("clipboardEvents", "timestamp", filters, pageSize, lastDoc);
    const snapshot = await getDocs(q);
    let events = snapshot.docs.slice(0, pageSize).map((d) => ({
      id: d.id,
      ...d.data(),
    })) as unknown as ClipboardEvent[];

    events = clientFilter(events, filters);

    return {
      events,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[Math.min(pageSize - 1, snapshot.docs.length - 1)] : undefined,
      hasMore: snapshot.docs.length > pageSize,
    };
  },

  async getUsbEvents(
    filters: EventFilters = {},
    pageSize = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ events: RemovableMediaEvent[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    const q = buildDateQuery("usbEvents", "timestamp", filters, pageSize, lastDoc);
    const snapshot = await getDocs(q);
    let events = snapshot.docs.slice(0, pageSize).map((d) => ({
      id: d.id,
      ...d.data(),
    })) as unknown as RemovableMediaEvent[];

    events = clientFilter(events, filters);

    return {
      events,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[Math.min(pageSize - 1, snapshot.docs.length - 1)] : undefined,
      hasMore: snapshot.docs.length > pageSize,
    };
  },

  async getAllUploadEvents(startDate?: Date, endDate?: Date) {
    const constraints: QueryConstraint[] = [orderBy("timestamp", "desc")];
    if (startDate) constraints.push(where("timestamp", ">=", Timestamp.fromDate(startDate)));
    if (endDate) constraints.push(where("timestamp", "<=", Timestamp.fromDate(endDate)));

    const q = query(collection(db, "uploadEvents"), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ eventId: d.id, ...d.data() })) as UploadEvent[];
  },

  async getAiEvents(
    filters: EventFilters = {},
    pageSize = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ events: AiApplicationEvent[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    const q = buildDateQuery("aiApplicationEvents", "timestamp", filters, pageSize, lastDoc);
    const snapshot = await getDocs(q);
    let events = snapshot.docs.slice(0, pageSize).map((d) => ({
      id: d.id,
      ...d.data(),
    })) as unknown as AiApplicationEvent[];

    events = clientFilter(events, filters);

    return {
      events,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[Math.min(pageSize - 1, snapshot.docs.length - 1)] : undefined,
      hasMore: snapshot.docs.length > pageSize,
    };
  },
};
