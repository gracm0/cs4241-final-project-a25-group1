import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    // Dev server config
    server: {
        port: 5173, // default, but explicit
        open: true, // auto-open browser
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false
            }
        }
    },

    // Build config
    build: {
        outDir: "dist", // ensure frontend builds into apps/frontend/dist
        sourcemap: true
    },

    // Base path (important for React Router in production)
    base: "/"
});
