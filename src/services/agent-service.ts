import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { AgentHeartbeat } from "../types/agent";
import { ENV } from "../config/environment";

export const agentService = {
  async getAllAgents(): Promise<AgentHeartbeat[]> {
    const snapshot = await getDocs(collection(db, "agents"));
    return snapshot.docs.map((d) => ({
      agentId: d.id,
      ...d.data(),
    })) as AgentHeartbeat[];
  },

  async getAgentById(agentId: string): Promise<AgentHeartbeat | null> {
    const docSnap = await getDoc(doc(db, "agents", agentId));
    return docSnap.exists() ? ({ agentId: docSnap.id, ...docSnap.data() } as AgentHeartbeat) : null;
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
