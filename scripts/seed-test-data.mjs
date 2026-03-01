import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../dataguard-sentinel-firebase-adminsdk-fbsvc-deab094695.json"), "utf8")
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seedTestUser() {
  const userId = "test-user-001";

  // ── users document ─────────────────────────────────────────────────────
  await db.collection("users").doc(userId).set({
    userId,
    username: "john.doe",
    employeeId: "EMP-001",
    machineName: "WORKSTATION-01",
    department: "Engineering",
    email: "john.doe@company.com",
    status: "active",
    registeredAt: Timestamp.now(),
    registeredBy: "agent",
  });
  console.log("✅ users/test-user-001 created");

  // ── riskProfiles document ──────────────────────────────────────────────
  await db.collection("riskProfiles").doc(userId).set({
    userId,
    username: "john.doe",
    employeeId: "EMP-001",
    machineName: "WORKSTATION-01",
    department: "Engineering",
    behavioralRiskScore: 35,
    currentRiskLevel: "Medium",
    totalUploads: 12,
    blockedUploads: 2,
    highRiskUploads: 3,
    lastActivity: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  console.log("✅ riskProfiles/test-user-001 created");

  // ── agents document ────────────────────────────────────────────────────
  await db.collection("agents").doc("agent-001").set({
    agentId: "agent-001",
    machineName: "WORKSTATION-01",
    userId,
    organizationId: "default",
    osVersion: "Windows 11",
    agentVersion: "1.0.0",
    status: "active",
    lastHeartbeat: Timestamp.now(),
    registeredAt: Timestamp.now(),
  });
  console.log("✅ agents/agent-001 created");

  // ── sample uploadEvent ─────────────────────────────────────────────────
  await db.collection("uploadEvents").add({
    userId,
    employeeId: "EMP-001",
    deviceId: "agent-001",
    machineName: "WORKSTATION-01",
    fileName: "report-Q1-2026.xlsx",
    fileExtension: ".xlsx",
    fileSizeBytes: 245760,
    channel: "Browser",
    sensitivityLevel: "Confidential",
    category: "Spreadsheet",
    transactionRiskScore: 45,
    isBlocked: false,
    blockReason: null,
    destinationUrl: "https://drive.google.com/upload",
    timestamp: Timestamp.now(),
  });
  console.log("✅ uploadEvents sample created");

  // ── sample alert ───────────────────────────────────────────────────────
  await db.collection("alerts").add({
    alertId: `alert-${Date.now()}`,
    userId,
    employeeId: "EMP-001",
    type: "Warning",
    channel: "Browser",
    title: "Sensitive File Upload Detected",
    message: "User uploaded a Confidential spreadsheet to Google Drive.",
    fileName: "report-Q1-2026.xlsx",
    riskScore: 45,
    sensitivityLevel: "Confidential",
    isResolved: false,
    timestamp: Timestamp.now(),
  });
  console.log("✅ alerts sample created");

  console.log("\n🎉 Test data seeded! Refresh the dashboard to see the data.");
  process.exit(0);
}

seedTestUser().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
