import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // 使用相对路径，解决静态托管部署时的资源加载问题
  build: {
    rollupOptions: {
      output: {
        // Split the heavy vendor libs so the first paint is not blocked by them.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          cloudbase: ["@cloudbase/js-sdk"],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  server: {
    host: "127.0.0.1",
    proxy: {
      "/__auth": {
        target: "https://envId-appid.tcloudbaseapp.com/",
        changeOrigin: true,
      },
    },
    allowedHosts: true,
  },
});