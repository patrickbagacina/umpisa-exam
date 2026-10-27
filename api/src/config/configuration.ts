export interface AppConfig {
  port: number;
  corsOrigin: string;
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

type Env = Record<string, string | undefined>;

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

// Every value has a local-development default so the app runs without a .env file.
export function loadConfig(env: Env = process.env): AppConfig {
  return {
    port: toInt(env.PORT, 3000),
    corsOrigin: env.CORS_ORIGIN ?? 'http://localhost:5173',
    db: {
      host: env.DB_HOST ?? 'localhost',
      port: toInt(env.DB_PORT, 3307),
      username: env.DB_USER ?? 'lostfound',
      password: env.DB_PASSWORD ?? 'lostfound',
      database: env.DB_NAME ?? 'lostfound',
    },
    jwt: {
      secret: env.JWT_SECRET ?? 'dev-only-insecure-jwt-secret',
      expiresIn: env.JWT_EXPIRES_IN ?? '8h',
    },
  };
}

export default () => loadConfig();
