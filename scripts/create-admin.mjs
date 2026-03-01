import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../dataguard-sentinel-firebase-adminsdk-fbsvc-deab094695.json"), "utf8")
);

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

const ADMIN_EMAIL = "admin@data.com";
const ADMIN_NAME = "Dashboard Admin";

async function createDashboardAdmin() {
  console.log(`🔍 Looking up Firebase Auth user: ${ADMIN_EMAIL}`);

  let uid;
  try {
    const user = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = user.uid;
    console.log(`✅ Found existing Auth user — UID: ${uid}`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      console.log(`⚠️  No Auth user found — creating new Firebase Auth account...`);
      const TEMP_PASSWORD = "Admin@123456";
      const newUser = await auth.createUser({
        email: ADMIN_EMAIL,
        password: TEMP_PASSWORD,
        displayName: ADMIN_NAME,
        emailVerified: true,
      });
      uid = newUser.uid;
      console.log(`✅ Created Auth user — UID: ${uid}`);
      console.log(`   Temporary password: ${TEMP_PASSWORD}`);
      console.log(`   ⚠️  Change this password after first login!`);
    } else {
      console.error("❌ Firebase Auth error:", err.message);
      process.exit(1);
    }
  }

  const adminRef = db.collection("dashboardAdmins").doc(uid);

  await adminRef.set({
    uid,
    email: ADMIN_EMAIL,
    displayName: ADMIN_NAME,
    role: "dashboard_admin",
    createdAt: Timestamp.now(),
    lastLoginAt: null,
    passwordChangedAt: null,
    isActive: true,
  });

  console.log(`🎉 dashboardAdmins/${uid} created successfully!`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Role:  dashboard_admin`);
  console.log("\nYou can now log in to the dashboard.");
  process.exit(0);
}

createDashboardAdmin().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
