import { defineConfig, devices } from "@playwright/test";

// Уночі на staging: E2E_BASE_URL вказує на staging (sandbox PayLink).
// Локально: піднімаємо paylink-sandbox, api і web; Postgres — docker compose.
const stagingUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: stagingUrl ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: stagingUrl ?? "http://localhost:5173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: stagingUrl
    ? undefined
    : [
        {
          command: "npm run start --workspace @c10/paylink-sandbox",
          cwd: "..",
          url: "http://localhost:4010/health",
          reuseExistingServer: true,
          stdout: "ignore",
        },
        {
          command: "npm run db:migrate && npm run db:seed && npm run start --workspace @c10/api",
          cwd: "..",
          url: "http://localhost:3000/health",
          reuseExistingServer: true,
        },
        {
          command: "npm run dev --workspace @c10/web",
          cwd: "..",
          url: "http://localhost:5173",
          reuseExistingServer: true,
        },
      ],
});
