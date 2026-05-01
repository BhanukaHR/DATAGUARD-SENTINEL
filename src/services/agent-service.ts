import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { AgentHeartbeat } from "../types/agent";
import { ENV } from "../config/environment";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAgent(raw: Record<string, any>): Record<string, any> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const camel = key.charAt(0).toLowerCase() + key.slice(1);
    result[camel] = value;
    if (camel !== key) result[key] = value;
  }
  if (!result.lastHeartbeat && result.lastHeartBeat) result.lastHeartbeat = result.lastHeartBeat;
  if (!result.lastHeartbeat && result.lastHeartbeatAt) result.lastHeartbeat = result.lastHeartbeatAt;
  if (!result.lastHeartbeat && result.lastSeenAt) result.lastHeartbeat = result.lastSeenAt;
  if (!result.machineName && result.machine) result.machineName = result.machine;
  if (!result.currentUserId && result.userId) result.currentUserId = result.userId;
  if (!result.agentVersion && result.version) result.agentVersion = result.version;
  if (!result.endpointUniqueId && result.endpointUniqueID) result.endpointUniqueId = result.endpointUniqueID;
  if (!result.endpointUniqueId && result.endpoint_unique_id) result.endpointUniqueId = result.endpoint_unique_id;
  if (!result.endpointUniqueId && result.endpointId) result.endpointUniqueId = result.endpointId;
  if (!result.endpointUniqueId && result.endpointID) result.endpointUniqueId = result.endpointID;
  if (!result.endpointUniqueId && result.deviceId) result.endpointUniqueId = result.deviceId;
  if (!result.agentId && result.endpointUniqueId) result.agentId = result.endpointUniqueId;
  if (!result.status) result.status = "offline";
  return result;
}

export const agentService = {
  async getAllAgents(): Promise<AgentHeartbeat[]> {
    const snapshot = await getDocs(collection(db, "agents"));
    return snapshot.docs.map((d) => ({
      agentId: d.id,
      ...normalizeAgent(d.data()),
    })) as AgentHeartbeat[];
  },

  async getAgentById(agentId: string): Promise<AgentHeartbeat | null> {
    const docSnap = await getDoc(doc(db, "agents", agentId));
    return docSnap.exists() ? ({ agentId: docSnap.id, ...normalizeAgent(docSnap.data()) } as AgentHeartbeat) : null;
  },

  getAgentStatus(lastHeartbeat: Date | string | { seconds: number; toDate?: () => Date }): "online" | "warning" | "offline" {
    let heartbeatTime: Date;
    if (typeof lastHeartbeat === "string") {
      heartbeatTime = new Date(lastHeartbeat);
    } else if (lastHeartbeat && typeof (lastHeartbeat as { toDate?: () => Date }).toDate === "function") {
      heartbeatTime = (lastHeartbeat as { toDate: () => Date }).toDate();
    } else if (lastHeartbeat && typeof (lastHeartbeat as { seconds: number }).seconds === "number") {
      heartbeatTime = new Date((lastHeartbeat as { seconds: number }).seconds * 1000);
    } else {
      heartbeatTime = lastHeartbeat as Date;
    }
    const diffSeconds = (Date.now() - heartbeatTime.getTime()) / 1000;

    if (diffSeconds <= ENV.HEARTBEAT_TIMEOUT) return "online";
    if (diffSeconds <= ENV.HEARTBEAT_TIMEOUT * 5) return "warning";
    return "offline";
  },

  async getAgentStats(): Promise<{ total: number; online: number; warning: number; offline: number }> {
    const agents = await this.getAllAgents();
    return {
      total: agents.length,
      online: agents.filter((a) => this.getAgentStatus(a.lastHeartbeat) === "online").length,
      warning: agents.filter((a) => this.getAgentStatus(a.lastHeartbeat) === "warning").length,
      offline: agents.filter((a) => this.getAgentStatus(a.lastHeartbeat) === "offline").length,
    };
  },
};
