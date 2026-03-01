import * as signalR from "@microsoft/signalr";

const HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || "";

/**
 * Returns true when a real SignalR backend URL has been configured.
 * localhost URLs are allowed during local development but the empty
 * default means "no backend available" (e.g. Vercel deployment).
 */
export const isSignalREnabled = (): boolean => {
  return HUB_URL.length > 0;
};

export const createHubConnection = (): signalR.HubConnection | null => {
  if (!isSignalREnabled()) return null;

  return new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      // Skip HTTP negotiation — go straight to WebSockets to avoid CORS preflight failures
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
};
