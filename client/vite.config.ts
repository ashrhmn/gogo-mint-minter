import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    // hmr: {
    //   clientPort: 3000,
    // },
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.PORT || 80}`,
        changeOrigin: true,
      },
    },
  },
});
