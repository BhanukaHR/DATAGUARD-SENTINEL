import { useEffect, useRef, useCallback, useState } from "react";
import { createHubConnection } from "../config/signalr";
import { useAlertStore } from "../store/alert-store";
import { toast } from "sonner";
import type * as signalR from "@microsoft/signalr";
import type { DlpAlert } from "../types/dlp-alert";
import type { UploadEvent } from "../types/upload-event";
import type { AiApplicationEvent } from "../types/ai-application-event";
import type { FtpTransferEvent } from "../types/ftp-event";
import type { EmailExfiltrationEvent } from "../types/email-event";

function parsePayload<T = Record<string, unknown>>(raw: unknown): T {
  const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
  // Normalise first-char-uppercase keys to camelCase
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const camel = key.charAt(0).toLowerCase() + key.slice(1);
    result[camel] = value;
    // Keep original key too so both casings work
    if (camel !== key) result[key] = value;
  }
  return result as T;
}

export function useSignalR() {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { addAlert, addUploadEvent, addAiEvent, addFtpEvent, addEmailEvent, updateRiskProfile, addEscalation, updateAgentStatus } = useAlertStore();

  useEffect(() => {
    let cancelled = false;
    let startTimerId: ReturnType<typeof setTimeout> | null = null;

    const connection = createHubConnection();
    connectionRef.current = connection;

    connection.on("ReceiveAlert", (raw) => {
      try {
        const alert = parsePayload<DlpAlert>(raw);
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

        if (Notification.permission === "granted" && alert.type === "Critical") {
          new Notification("DataGuard Sentinel — Critical Alert", {
            body: alert.message,
            icon: "/logo.svg",
            tag: alert.alertId,
          });
        }
      } catch (err) {
        console.warn("Failed to parse alert:", err);
      }
    });

    connection.on("ReceiveUploadEvent", (raw) => {
      try {
        addUploadEvent(parsePayload<UploadEvent>(raw));
      } catch (err) {
        console.warn("Failed to parse upload event:", err);
      }
    });

    connection.on("ReceiveRiskUpdate", (profileRaw, brsRaw) => {
      try {
        updateRiskProfile(parsePayload(profileRaw), parsePayload(brsRaw));
      } catch (err) {
        console.warn("Failed to parse risk update:", err);
      }
    });

    connection.on("ReceiveEscalation", (raw) => {
      try {
        const data = parsePayload<Partial<DlpAlert> & Record<string, unknown>>(raw);
        addEscalation(data);
        const brs = (data as Record<string, unknown>).behavioralRiskScore ?? (data as Record<string, unknown>).brs ?? "";
        toast.error(`ESCALATION: ${data.username} (BRS: ${brs})`, {
          description: String((data as Record<string, unknown>).reason ?? ""),
          duration: 15000,
        });
      } catch (err) {
        console.warn("Failed to parse escalation:", err);
      }
    });

    connection.on("ReceiveAiEvent", (raw) => {
      try {
        const event = parsePayload<AiApplicationEvent>(raw);
        addAiEvent(event);
        const user = event.username || event.userId || "Unknown";
        toast.warning(`AI Event: ${event.applicationName}`, {
          description: `${event.eventType} detected by ${user} (Risk: ${event.riskScore})`,
        });
      } catch (err) {
        console.warn("Failed to parse AI event:", err);
      }
    });

    connection.on("ReceiveFtpEvent", (raw) => {
      try {
        const event = parsePayload<FtpTransferEvent>(raw);
        addFtpEvent(event);
        toast.warning(`FTP Event: ${event.applicationName}`, {
          description: `${event.eventType} — ${event.remoteAddress}:${event.remotePort}`,
        });
      } catch (err) {
        console.warn("Failed to parse FTP event:", err);
      }
    });

    connection.on("ReceiveEmailEvent", (raw) => {
      try {
        const event = parsePayload<EmailExfiltrationEvent>(raw);
        addEmailEvent(event);
        toast.warning(`Email Event: ${event.applicationName}`, {
          description: `${event.eventType} — ${event.recipient || event.subject || 'Activity detected'}`,
        });
      } catch (err) {
        console.warn("Failed to parse email event:", err);
      }
    });

    connection.on("AgentStatusUpdate", (raw) => {
      try {
        updateAgentStatus(parsePayload(raw));
      } catch (err) {
        console.warn("Failed to parse agent status:", err);
      }
    });

    connection.on("AgentConnected", (raw) => {
      try {
        updateAgentStatus(parsePayload(raw));
      } catch (err) {
        console.warn("Failed to parse agent connection:", err);
      }
    });

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => {
      setIsConnected(true);
      connection.invoke("JoinDashboard");
    });
    connection.onclose(() => setIsConnected(false));

    // Defer start slightly so React StrictMode cleanup can cancel before connection begins
    startTimerId = setTimeout(() => {
      if (cancelled) return;
      connection
        .start()
        .then(() => {
          if (cancelled) {
            connection.stop();
            return;
          }
          setIsConnected(true);
          connection.invoke("JoinDashboard");
        })
        .catch((err) => {
          if (!cancelled) {
            console.warn("SignalR connection failed:", err);
            setIsConnected(false);
          }
        });
    }, 100);

    return () => {
      cancelled = true;
      if (startTimerId) clearTimeout(startTimerId);
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

  return { isConnected, sendCommand, broadcastPolicy, pingAgent };
}
