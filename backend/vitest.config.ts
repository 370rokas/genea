import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    env: {
      LOG_LEVEL: "error",
      NODE_ENV: "test",
      JWT_SECRET: "super_secret_test_key",
    },
  },
});
