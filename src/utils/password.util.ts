import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../config/config';

/**
 * Hash a plain-text password using bcrypt.
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, config.security.bcryptSaltRounds);
};

/**
 * Compare a plain-text password against a bcrypt hash.
 */
export const comparePassword = async (
  plainPassword: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hash);
};

/**
 * Hash a refresh token with SHA-256 before storing it in the DB.
 * The raw token is sent to the client; the hash is stored — similar
 * to how password resets are handled securely.
 */
export const hashToken = (rawToken: string): string => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};
