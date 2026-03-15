import dotenv from 'dotenv';
import path from 'path';

// Use an absolute path so dotenv always finds .env regardless of
// where nodemon/ts-node is invoked from.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ── Helper: require an env var or throw at startup ────────
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// ── Exported config object ────────────────────────────────
const config = {
  server: {
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    port: parseInt(process.env['PORT'] ?? '3000', 10),
  },
  db: {
    uri: requireEnv('MONGODB_URI'),
  },
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  },
  security: {
    bcryptSaltRounds: parseInt(process.env['BCRYPT_SALT_ROUNDS'] ?? '12', 10),
    corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5174',
  },
} as const;

export default config;
