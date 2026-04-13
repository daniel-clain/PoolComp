import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const backendPort = env.VITE_DEV_BACKEND_PORT || "3000";

  return {
    server: {
      host: true,
      // Quick tunnels use a new *.trycloudflare.com host each run; allow any Host for local dev.
      allowedHosts: true,
      proxy: {
        "/ws": {
          target: `http://127.0.0.1:${backendPort}`,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
