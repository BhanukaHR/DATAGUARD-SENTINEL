import * as signalR from "@microsoft/signalr";

const HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || "http://localhost:5000/hubs/monitoring";

export const createHubConnection = (): signalR.HubConnection => {
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
