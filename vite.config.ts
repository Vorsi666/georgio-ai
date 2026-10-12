import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // 使用相对路径，解决静态托管部署时的资源加载问题
  build: {
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) tidak dukung manualChunks objek — pakai advancedChunks.
        // Split vendor berat supaya first paint chat tetap ringan.
        advancedChunks: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: "cloudbase", test: /node_modules[\\/]@cloudbase[\\/]/ },
            // Player Remotion (~300KB) dipisah supaya first paint chat ringan.
            { name: "remotion", test: /node_modules[\\/](remotion|@remotion)[\\/]/ },
          ],
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