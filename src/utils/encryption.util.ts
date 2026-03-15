import crypto from 'crypto';
import config from '../config/config';

// ── Encryption Constants ─────────────────────────────────────
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * AES Encryption Utility
 * Provides methods to encrypt and decrypt sensitive data (Node details)
 * before storing them in the database.
 */
class EncryptionUtil {
  private static readonly key = crypto
    .createHash('sha256')
    .update(config.jwt.accessSecret) // Using the JWT secret as a base key for now
    .digest();

  /**
   * Encrypts a string using AES-256-CBC
   */
  public static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(this.key), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return IV + encrypted data as a single string (hex format)
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypts a string using AES-256-CBC
   */
  public static decrypt(encryptedText: string): string {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedTextBuffer = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(this.key), iv);
    
    let decrypted = decipher.update(encryptedTextBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  }

  /**
   * Helper to encrypt objects by stringifying them first
   */
  public static encryptObject(obj: any): string {
    return this.encrypt(JSON.stringify(obj));
  }

  /**
   * Helper to decrypt strings back into objects
   */
  public static decryptObject<T>(encryptedText: string): T {
    return JSON.parse(this.decrypt(encryptedText)) as T;
  }
}

export default EncryptionUtil;
