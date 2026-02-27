export interface AgentHeartbeat {
  agentId: string;
  machineName: string;
  organizationId: string;
  lastHeartbeat: Date | string;
  status: "online" | "offline" | "warning";
  scanCount: number;
  currentUserId: string;
  currentUsername?: string;
  agentVersion?: string;
  osVersion?: string;
  ipAddress?: string;
}
