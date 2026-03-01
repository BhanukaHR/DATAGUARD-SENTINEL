import {
  collection, getDocs, doc, getDoc, deleteDoc, updateDoc,
  query, where, limit, startAfter, DocumentSnapshot
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { UserAccount } from "../types/user";
import type { UserRiskProfile } from "../types/user-risk-profile";

const USERS = "users";
const RISK_PROFILES = "riskProfiles";
const UPLOAD_EVENTS = "uploadEvents";
const CLIPBOARD_EVENTS = "clipboardEvents";
const USB_EVENTS = "usbEvents";
const ALERTS = "alerts";
const AGENTS = "agents";

export const userService = {
  async getAllUsers(
    pageSize = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ users: UserAccount[]; lastDoc: DocumentSnapshot | undefined; hasMore: boolean }> {
    // Use simple collection scan — orderBy("registeredAt") silently drops docs missing that field
    let q = query(collection(db, USERS), limit(pageSize + 1));
    if (lastDoc) {
      q = query(collection(db, USERS), startAfter(lastDoc), limit(pageSize + 1));
    }
    const snapshot = await getDocs(q);
    // Sort client-side so docs without registeredAt still appear
    const users = snapshot.docs
      .slice(0, pageSize)
      .map((d) => ({ userId: d.id, ...d.data() } as UserAccount))
      .sort((a, b) => {
        const aTime = a.registeredAt ? new Date(typeof a.registeredAt === "object" ? (a.registeredAt as { seconds?: number }).seconds! * 1000 : a.registeredAt as string).getTime() : 0;
        const bTime = b.registeredAt ? new Date(typeof b.registeredAt === "object" ? (b.registeredAt as { seconds?: number }).seconds! * 1000 : b.registeredAt as string).getTime() : 0;
        return bTime - aTime;
      });

    return {
      users,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[Math.min(pageSize - 1, snapshot.docs.length - 1)] : undefined,
      hasMore: snapshot.docs.length > pageSize,
    };
  },

  async searchUsers(searchTerm: string): Promise<UserAccount[]> {
    const snapshot = await getDocs(collection(db, USERS));
    const term = searchTerm.toLowerCase();
    return snapshot.docs
      .map((d) => ({ userId: d.id, ...d.data() } as UserAccount))
      .filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.employeeId.toLowerCase().includes(term) ||
          user.machineName.toLowerCase().includes(term)
      );
  },

  async getUserById(userId: string): Promise<UserAccount | null> {
    const docSnap = await getDoc(doc(db, USERS, userId));
    return docSnap.exists() ? ({ userId: docSnap.id, ...docSnap.data() } as UserAccount) : null;
  },

  async getUserRiskProfile(userId: string): Promise<UserRiskProfile | null> {
    const docSnap = await getDoc(doc(db, RISK_PROFILES, userId));
    return docSnap.exists() ? (docSnap.data() as UserRiskProfile) : null;
  },

  async removeUser(userId: string): Promise<{ success: boolean; error?: string; deletedCounts: Record<string, number> }> {
    try {
      const deletedCounts: Record<string, number> = {};

      await deleteDoc(doc(db, USERS, userId));
      deletedCounts.users = 1;

      const riskProfileDoc = doc(db, RISK_PROFILES, userId);
      const riskSnap = await getDoc(riskProfileDoc);
      if (riskSnap.exists()) {
        await deleteDoc(riskProfileDoc);
        deletedCounts.riskProfiles = 1;
      }

      const collections = [
        { name: UPLOAD_EVENTS, field: "employeeId" },
        { name: CLIPBOARD_EVENTS, field: "employeeId" },
        { name: USB_EVENTS, field: "employeeId" },
        { name: ALERTS, field: "userId" },
        { name: AGENTS, field: "currentUserId" },
      ];

      for (const { name, field } of collections) {
        const q = query(collection(db, name), where(field, "==", userId));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
        deletedCounts[name] = snap.size;
      }

      return { success: true, deletedCounts };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error", deletedCounts: {} };
    }
  },

  async markUserAsUninstalled(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, USERS, userId), {
        status: "uninstalled",
        uninstalledAt: new Date(),
      });
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  async getUserStats(): Promise<{ total: number; active: number; inactive: number; uninstalled: number }> {
    const snapshot = await getDocs(collection(db, USERS));
    const users = snapshot.docs.map((d) => d.data());
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      inactive: users.filter((u) => u.status === "inactive").length,
      uninstalled: users.filter((u) => u.status === "uninstalled" || u.status === "removed").length,
    };
  },
};
