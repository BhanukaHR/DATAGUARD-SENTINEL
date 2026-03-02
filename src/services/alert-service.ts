import {
  collection, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit, startAfter,
  onSnapshot, Timestamp, DocumentSnapshot, type QueryConstraint, type Unsubscribe
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { DlpAlert } from "../types/dlp-alert";

export interface AlertFilters {
  type?: string;
  channel?: string;
  isResolved?: boolean;
  startDate?: Date;
  endDate?: Date;
  isEscalation?: boolean;
}

export const alertService = {
  async getAlerts(
    filters: AlertFilters = {},
    pageSize = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ alerts: DlpAlert[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    const constraints: QueryConstraint[] = [];

    if (filters.startDate) {
      constraints.push(where("timestamp", ">=", Timestamp.fromDate(filters.startDate)));
    }
    if (filters.endDate) {
      constraints.push(where("timestamp", "<=", Timestamp.fromDate(filters.endDate)));
    }
    // Always sort by timestamp descending so newest alerts appear first
    constraints.push(orderBy("timestamp", "desc"));
    constraints.push(limit(pageSize + 1));
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, "alerts"), ...constraints);
    const snapshot = await getDocs(q);

    let alerts = snapshot.docs.slice(0, pageSize).map((d) => ({
      alertId: d.id,
      ...d.data(),
      // Ensure isEscalation defaults to false if not set in Firestore
      isEscalation: d.data().isEscalation ?? false,
    })) as DlpAlert[];

    // Client-side filtering
    if (filters.type) alerts = alerts.filter((a) => a.type === filters.type);
    if (filters.channel) alerts = alerts.filter((a) => a.channel === filters.channel);
    if (filters.isResolved !== undefined) alerts = alerts.filter((a) => a.isResolved === filters.isResolved);
    if (filters.isEscalation !== undefined) alerts = alerts.filter((a) => a.isEscalation === filters.isEscalation);

    return {
      alerts,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[Math.min(pageSize - 1, snapshot.docs.length - 1)] : undefined,
      hasMore: snapshot.docs.length > pageSize,
    };
  },

  async getAlertById(alertId: string): Promise<DlpAlert | null> {
    const docSnap = await getDoc(doc(db, "alerts", alertId));
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      alertId: docSnap.id,
      ...data,
      isEscalation: data.isEscalation ?? false,
    } as DlpAlert;
  },

  async resolveAlert(
    alertId: string,
    resolvedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, "alerts", alertId), {
        isResolved: true,
        resolvedBy,
        resolvedAt: new Date(),
      });
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  async addInvestigationNotes(
    alertId: string,
    notes: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, "alerts", alertId), {
        investigationNotes: notes,
      });
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  async markAsRead(alertId: string): Promise<void> {
    await updateDoc(doc(db, "alerts", alertId), { isRead: true });
  },

  async getUnresolvedCount(): Promise<number> {
    const q = query(collection(db, "alerts"), where("isResolved", "==", false));
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  async getAlertStats(): Promise<{
    total: number;
    unresolved: number;
    critical: number;
    escalations: number;
  }> {
    const snapshot = await getDocs(collection(db, "alerts"));
    const alerts = snapshot.docs.map((d) => d.data());
    return {
      total: alerts.length,
      unresolved: alerts.filter((a) => !a.isResolved).length,
      critical: alerts.filter((a) => a.type === "Critical").length,
      escalations: alerts.filter((a) => a.isEscalation).length,
    };
  },

  /**
   * Subscribe to real-time alert updates from Firestore.
   * Returns an unsubscribe function to stop listening.
   */
  subscribeToAlerts(
    onNewAlert: (alert: DlpAlert) => void,
    onUpdate: (alerts: DlpAlert[]) => void,
    limitCount = 50
  ): Unsubscribe {
    const q = query(
      collection(db, "alerts"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    let isFirstSnapshot = true;

    return onSnapshot(q, (snapshot) => {
      const allAlerts = snapshot.docs.map((d) => ({
        alertId: d.id,
        ...d.data(),
        isEscalation: d.data().isEscalation ?? false,
      })) as DlpAlert[];

      // On first load, just send all alerts
      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        onUpdate(allAlerts);
        return;
      }

      // On subsequent updates, notify about new documents
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const alert = {
            alertId: change.doc.id,
            ...change.doc.data(),
            isEscalation: change.doc.data().isEscalation ?? false,
          } as DlpAlert;
          onNewAlert(alert);
        }
      });

      onUpdate(allAlerts);
    });
  },
};
