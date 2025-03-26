module.exports = {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/__tests__/**",
    "!src/__mocks__/**",
  ],
  coverageReporters: ["text", "lcov"],
  testTimeout: 30000,
  setupFilesAfterEnv: ['./jest.setup.js']
};