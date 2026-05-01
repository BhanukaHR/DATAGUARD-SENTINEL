import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts")) return "charts";
          if (id.includes("firebase")) return "firebase";
          if (id.includes("@microsoft/signalr")) return "signalr";
          if (id.includes("xlsx") || id.includes("jspdf") || id.includes("html2canvas")) return "export";
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("zustand")) return "state";
          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("react")) return "react";
          return;
        },
      },
      onwarn(warning, warn) {
        if (warning.message && warning.message.includes("contains an annotation that Rollup cannot interpret")) {
          return;
        }
        warn(warning);
      },
    },
  },
});
