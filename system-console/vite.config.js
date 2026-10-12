import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), {
    name: "console-route-entry",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const pathname = (req.url || "/").split("?")[0];
        if (pathname === "/login" || pathname === "/admin" || pathname.startsWith("/admin/")) {
          req.url = "/system.html";
        }
        next();
      });
    },
  }],
  base: "/",
  server: {
    host: "127.0.0.1", port: 8399,
    proxy: process.env.DC_API_TARGET ? {
      "/api/": { target: process.env.DC_API_TARGET, changeOrigin: true },
    } : undefined,
  },
  build: {
    rollupOptions: {
      input: "system.html",
    },
  },
});
