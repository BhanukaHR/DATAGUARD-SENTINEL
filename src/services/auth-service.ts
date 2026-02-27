import {
  signInWithEmailAndPassword, signOut, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider, updateEmail
} from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { sha256 } from "../utils/hash";

const DASHBOARD_ADMIN_COLLECTION = "dashboardAdmins";
const AGENT_ADMIN_COLLECTION = "admins";

export const authService = {
  // ═══════════════════════════════════════════════════════════
  //  DASHBOARD ADMIN AUTH (for logging into the dashboard)
  // ═══════════════════════════════════════════════════════════

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const adminDoc = await getDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, uid));
      if (!adminDoc.exists() || adminDoc.data().role !== "dashboard_admin") {
        await signOut(auth);
        return {
          success: false,
          error: "This account is not a dashboard administrator. Agent admin accounts cannot log in to the dashboard."
        };
      }

      await updateDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, uid), {
        lastLoginAt: new Date(),
      });

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async changeDashboardPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return { success: false, error: "No authenticated user" };
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      await updateDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, user.uid), {
        passwordChangedAt: new Date(),
      });

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error && (error as { code?: string }).code === "auth/wrong-password") {
        return { success: false, error: "Current password is incorrect" };
      }
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  async changeDashboardEmail(
    currentPassword: string,
    newEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return { success: false, error: "No authenticated user" };
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);

      await updateDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, user.uid), {
        email: newEmail,
      });

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  async getDashboardAdminProfile() {
    const user = auth.currentUser;
    if (!user) return null;
    const adminDoc = await getDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, user.uid));
    return adminDoc.exists() ? { uid: user.uid, ...adminDoc.data() } : null;
  },

  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  },

  // ═══════════════════════════════════════════════════════════
  //  AGENT ADMIN CREDENTIAL MANAGEMENT (remote, from dashboard)
  // ═══════════════════════════════════════════════════════════

  async listAgentAdmins() {
    const snapshot = await getDocs(collection(db, AGENT_ADMIN_COLLECTION));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getAgentAdmin(agentAdminId: string) {
    const adminDoc = await getDoc(doc(db, AGENT_ADMIN_COLLECTION, agentAdminId));
    return adminDoc.exists() ? { id: adminDoc.id, ...adminDoc.data() } : null;
  },

  async changeAgentAdminPassword(
    agentAdminId: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const passwordHash = await sha256(newPassword + "DataGuardSalt2026");
      await updateDoc(doc(db, AGENT_ADMIN_COLLECTION, agentAdminId), {
        passwordHash,
        passwordChangedAt: new Date(),
        passwordChangedBy: "dashboard",
      });
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  async changeAgentAdminEmail(
    agentAdminId: string,
    newEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, AGENT_ADMIN_COLLECTION, agentAdminId), {
        email: newEmail,
      });
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
};
