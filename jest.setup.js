// Add global setup for all tests
console.log('Setting up Jest environment');

// Silence console logs during tests unless VERBOSE_TESTS=true
if (!process.env.VERBOSE_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Increase test timeout globally
jest.setTimeout(30000);