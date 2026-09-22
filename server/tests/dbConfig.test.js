describe('database configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.MONGODB_URI;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('uses MONGODB_URI when present', () => {
    process.env.MONGODB_URI = 'mongodb+srv://user:secret@cluster.example.mongodb.net/planetpulse';

    const { resolveMongoUri } = require('../config/db');

    expect(resolveMongoUri()).toBe(process.env.MONGODB_URI);
  });

  test('throws in production without MONGODB_URI', () => {
    process.env.NODE_ENV = 'production';

    const { resolveMongoUri } = require('../config/db');

    expect(() => resolveMongoUri()).toThrow('MONGODB_URI is required in production');
  });

  test('falls back to local development connection when MONGODB_URI is missing', () => {
    process.env.NODE_ENV = 'development';

    const { resolveMongoUri } = require('../config/db');

    expect(resolveMongoUri()).toBe('mongodb://127.0.0.1:27017/planetpulse');
  });

  test('masks credentials before logging', () => {
    const uri = 'mongodb://user:secret@cluster.mongodb.net/planetpulse';
    const { sanitizeUri } = require('../config/db');

    expect(sanitizeUri(uri)).toContain('user:****@');
    expect(sanitizeUri(uri)).not.toContain('secret');
  });
});
