module.exports = {
  projects: [
    {
      displayName: "dom",
      testEnvironment: "jsdom",
    },
    {
      displayName: "node",
      testEnvironment: "node",
    },
  ],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
};
