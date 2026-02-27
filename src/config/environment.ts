export const ENV = {
  APP_NAME: import.meta.env.VITE_APP_NAME || "DataGuard Sentinel",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  HEARTBEAT_TIMEOUT: Number(import.meta.env.VITE_AGENT_HEARTBEAT_TIMEOUT_SECONDS) || 60,
  REFRESH_INTERVAL: Number(import.meta.env.VITE_DASHBOARD_REFRESH_INTERVAL_MS) || 30000,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://localhost:5000/api",
  SIGNALR_HUB_URL: import.meta.env.VITE_SIGNALR_HUB_URL || "https://localhost:5000/hubs/monitoring",
};
