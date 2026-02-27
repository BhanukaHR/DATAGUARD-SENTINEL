import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useAuthStore } from "../store/auth-store";
import type { DashboardAdmin } from "../types/admin";

export function useAuth() {
  const { isAuthenticated, isLoading, admin, setAuth, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, "dashboardAdmins", user.uid));
          if (adminDoc.exists() && adminDoc.data().role === "dashboard_admin") {
            setAuth({
              isAuthenticated: true,
              admin: { uid: user.uid, ...adminDoc.data() } as unknown as DashboardAdmin,
            });
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    });

    return () => unsubscribe();
  }, [setAuth, setLoading, clearAuth]);

  return { isAuthenticated, isLoading, admin };
}
