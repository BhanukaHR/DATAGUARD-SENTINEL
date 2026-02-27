import { collection, getDocs, query, where, orderBy, Timestamp, limit, type QueryConstraint } from "firebase/firestore";
import { db } from "../config/firebase";
import type { AuditLog } from "../types/audit-log";

export const auditService = {
  async getAuditLogs(
    filters: { action?: string; channel?: string; startDate?: Date; endDate?: Date; userId?: string } = {},
    pageSize = 100
  ): Promise<AuditLog[]> {
    const constraints: QueryConstraint[] = [orderBy("timestamp", "desc")];

    if (filters.startDate) {
      constraints.push(where("timestamp", ">=", Timestamp.fromDate(filters.startDate)));
    }
    if (filters.endDate) {
      constraints.push(where("timestamp", "<=", Timestamp.fromDate(filters.endDate)));
    }
    constraints.push(limit(pageSize));

    const q = query(collection(db, "auditLogs"), ...constraints);
    const snapshot = await getDocs(q);

    let logs = snapshot.docs.map((d) => ({
      logId: d.id,
      ...d.data(),
    })) as AuditLog[];

    if (filters.action) logs = logs.filter((l) => l.action === filters.action);
    if (filters.channel) logs = logs.filter((l) => l.channel === filters.channel);
    if (filters.userId) logs = logs.filter((l) => l.userId === filters.userId);

    return logs;
  },
};
