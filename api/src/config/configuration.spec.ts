import { loadConfig } from './configuration';

describe('loadConfig', () => {
  it('falls back to local-development defaults when env is empty', () => {
    expect(loadConfig({})).toEqual({
      port: 3000,
      corsOrigin: 'http://localhost:5173',
      db: {
        host: 'localhost',
        port: 3307,
        username: 'lostfound',
        password: 'lostfound',
        database: 'lostfound',
      },
      jwt: { secret: 'dev-only-insecure-jwt-secret', expiresIn: '8h' },
    });
  });

  it('reads overrides from env', () => {
    const config = loadConfig({
      PORT: '4000',
      DB_HOST: 'db',
      DB_PORT: '3306',
      JWT_SECRET: 'other',
    });

    expect(config.port).toBe(4000);
    expect(config.db.host).toBe('db');
    expect(config.db.port).toBe(3306);
    expect(config.jwt.secret).toBe('other');
  });

  it('ignores non-numeric ports', () => {
    expect(loadConfig({ PORT: 'abc', DB_PORT: '' }).port).toBe(3000);
    expect(loadConfig({ DB_PORT: 'x' }).db.port).toBe(3307);
  });
});
