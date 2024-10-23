module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
};