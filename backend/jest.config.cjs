/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/config/swagger.ts",
    "!src/seed/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text-summary", "lcov"],
  testTimeout: 30000,
  // Tests run sequentially against a shared DB — keep ts-jest lenient on the
  // strict unused-locals rules that only matter for src.
  transform: {
    "^.+\\.ts$": ["ts-jest", { diagnostics: { ignoreCodes: [6133, 6196] } }],
  },
};
