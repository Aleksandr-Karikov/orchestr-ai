// Global mocks for ES modules that Jest can't handle
jest.mock("java-parser", () => ({
  parse: jest.fn(() => ({})), // Return empty AST, will fallback to regex parsing
}));

