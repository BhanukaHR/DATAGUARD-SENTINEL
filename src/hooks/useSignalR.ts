import { useEffect, useRef, useCallback, useState } from "react";
import { createHubConnection, isSignalREnabled } from "../config/signalr";
import { useAlertStore } from "../store/alert-store";
import { toast } from "sonner";
import type * as signalR from "@microsoft/signalr";

export type ConnectionMode = "signalr" | "firestore" | "offline";

export function useSignalR() {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mode, setMode] = useState<ConnectionMode>(
    isSignalREnabled() ? "offline" : "firestore"
  );
  const { addAlert, addUploadEvent, updateRiskProfile, addEscalation, updateAgentStatus } = useAlertStore();

  useEffect(() => {
    // If no SignalR URL configured, skip connection entirely.
    // The app will use Firestore real-time listeners instead.
    if (!isSignalREnabled()) {
      setMode("firestore");
      setIsConnected(true); // Firestore is always "connected"
      return;
    }

    const connection = createHubConnection();
    if (!connection) {
      setMode("firestore");
      setIsConnected(true);
      return;
    }

    connectionRef.current = connection;

    connection.on("ReceiveAlert", (alert) => {
      addAlert(alert);
      if (alert.type === "Critical") {
        toast.error(`CRITICAL: ${alert.title}`, {
          description: alert.message,
          duration: 10000,
        });
      } else if (alert.type === "Block") {
        toast.warning(`BLOCKED: ${alert.title}`, { description: alert.message });
      } else if (alert.type === "Warning") {
        toast.warning(alert.title, { description: alert.message });
      } else {
        toast.info(alert.title);
      }

      // Browser notification for critical alerts
      if (Notification.permission === "granted" && alert.type === "Critical") {
        new Notification("DataGuard Sentinel — Critical Alert", {
          body: alert.message,
          icon: "/logo.svg",
          tag: alert.alertId,
        });
      }
    });

    connection.on("ReceiveUploadEvent", (event) => addUploadEvent(event));
    connection.on("ReceiveRiskUpdate", (profile, brsResult) => updateRiskProfile(profile, brsResult));
    connection.on("ReceiveEscalation", (data) => {
      addEscalation(data);
      toast.error(`ESCALATION: ${data.username} (BRS: ${data.brs})`, {
        description: data.reason,
        duration: 15000,
      });
    });
    connection.on("AgentStatusUpdate", (heartbeat) => updateAgentStatus(heartbeat));
    connection.on("AgentConnected", (agentInfo) => updateAgentStatus(agentInfo));

    connection.onreconnecting(() => {
      setIsConnected(false);
      setMode("offline");
    });
    connection.onreconnected(() => {
      setIsConnected(true);
      setMode("signalr");
      connection.invoke("JoinDashboard");
    });
    connection.onclose(() => {
      setIsConnected(false);
      setMode("offline");
    });

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        setMode("signalr");
        connection.invoke("JoinDashboard");
      })
      .catch((err) => {
        console.warn("SignalR connection failed — falling back to Firestore:", err);
        setIsConnected(true); // Firestore still works
        setMode("firestore");
      });

    return () => {
      connection.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendCommand = useCallback(async (agentId: string, commandType: string, payload: string) => {
    await connectionRef.current?.invoke("SendCommandToAgent", agentId, commandType, payload);
  }, []);

  const broadcastPolicy = useCallback(async (policyJson: string) => {
    await connectionRef.current?.invoke("BroadcastPolicyUpdate", policyJson);
  }, []);

  const pingAgent = useCallback(async (agentId: string) => {
    await connectionRef.current?.invoke("PingAgent", agentId);
  }, []);

  return { isConnected, mode, sendCommand, broadcastPolicy, pingAgent };
}
