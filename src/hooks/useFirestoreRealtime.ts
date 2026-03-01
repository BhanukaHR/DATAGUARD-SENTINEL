import { useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAlertStore } from "../store/alert-store";
import { toast } from "sonner";
import type { DlpAlert } from "../types/dlp-alert";
import type { UploadEvent } from "../types/upload-event";

/**
 * Firestore-based real-time listener that replaces SignalR when no
 * backend server is available (e.g. Vercel deployment).
 *
 * Listens to the `alerts` and `uploadEvents` collections for new documents
 * and pushes them into the same Zustand store that SignalR would use.
 */
export function useFirestoreRealtime() {
  const {
    addAlert,
    addUploadEvent,
  } = useAlertStore();

  // Track whether this is the initial snapshot (skip toasting for existing docs)
  const initialAlertLoad = useRef(true);
  const initialUploadLoad = useRef(true);

  useEffect(() => {
    const unsubs: Unsubscribe[] = [];

    // --- Listen to alerts ---
    const alertsQuery = query(
      collection(db, "alerts"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    unsubs.push(
      onSnapshot(alertsQuery, (snapshot) => {
        if (initialAlertLoad.current) {
          // On first load, hydrate the store without toast noise
          const alerts = snapshot.docs.map(
            (d) => ({ alertId: d.id, ...d.data() } as DlpAlert)
          );
          // Push the latest few so the notification bell has items
          alerts.slice(0, 20).reverse().forEach((a) => addAlert(a));
          initialAlertLoad.current = false;
          return;
        }

        // After initial load, only process newly added docs
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const alert = { alertId: change.doc.id, ...change.doc.data() } as DlpAlert;
            addAlert(alert);

            // Show toast for new alerts
            if (alert.type === "Critical") {
              toast.error(`CRITICAL: ${alert.title}`, {
                description: alert.message,
                duration: 10000,
              });
            } else if (alert.type === "Block") {
              toast.warning(`BLOCKED: ${alert.title}`, {
                description: alert.message,
              });
            } else if (alert.type === "Warning") {
              toast.warning(alert.title, { description: alert.message });
            } else {
              toast.info(alert.title);
            }
          }
        });
      }, (err) => {
        console.warn("Firestore alerts listener error:", err);
      })
    );

    // --- Listen to upload events ---
    const uploadsQuery = query(
      collection(db, "uploadEvents"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    unsubs.push(
      onSnapshot(uploadsQuery, (snapshot) => {
        if (initialUploadLoad.current) {
          initialUploadLoad.current = false;
          return;
        }
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const event = { eventId: change.doc.id, ...change.doc.data() } as UploadEvent;
            addUploadEvent(event);
          }
        });
      }, (err) => {
        console.warn("Firestore uploadEvents listener error:", err);
      })
    );

    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
