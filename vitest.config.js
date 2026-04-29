import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    typecheck: {
      include: ["src/**/*.test.ts"],
    },
  },
});
