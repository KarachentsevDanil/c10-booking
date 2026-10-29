/** @type {import('jest').Config} */
const common = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/packages/shared/src/$1",
    "^@api/(.*)$": "<rootDir>/apps/api/src/$1",
  },
};

module.exports = {
  projects: [
    {
      ...common,
      displayName: "unit",
      testMatch: [
        "<rootDir>/apps/api/src/**/*.test.ts",
        "<rootDir>/packages/shared/src/**/*.test.ts",
      ],
    },
    {
      ...common,
      displayName: "integration",
      testMatch: ["<rootDir>/apps/api/test/integration/**/*.test.ts"],
      testTimeout: 120_000,
    },
  ],
};
