import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig({
  plugins: [
    checker({
      typescript: {
        tsconfigPath: "./tsconfig.json",
      },
    }),
  ],
  server: {
    host: true,
    // Quick tunnels use a new *.trycloudflare.com host each run; allow any Host for local dev.
    allowedHosts: true,
    proxy: {
      "/ws": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
