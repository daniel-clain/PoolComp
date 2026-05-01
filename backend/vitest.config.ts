import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "src/main.test.ts",
      "**/tournament-slot-assignment.service.test.ts",
      "**/ignore-me/**",
    ],
  },
});
