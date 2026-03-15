import User, { IUser } from '../models/User.model';
import RefreshToken from '../models/RefreshToken.model';
import { hashPassword, comparePassword, hashToken } from '../utils/password.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseExpiryToMs,
} from '../utils/jwt.util';
import { ConflictError, UnauthorizedError } from '../errors/AppError';
import config from '../config/config';
import type { Types } from 'mongoose';

// ── DTO shapes ─────────────────────────────────────────────
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
  };
  tokens: AuthTokens;
}

// ── Service class ──────────────────────────────────────────
class AuthService {
  /**
   * Register a new user.
   * Throws ConflictError if the email is already taken.
   */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await User.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
    });

    const tokens = await this.issueTokens(user);
    return this.buildAuthResult(user, tokens);
  }

  /**
   * Authenticate an existing user with email + password.
   * Throws UnauthorizedError on invalid credentials (intentionally vague).
   */
  async login(dto: LoginDto): Promise<AuthResult> {
    // Explicitly select passwordHash (it has select:false on the model)
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await comparePassword(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.issueTokens(user);
    return this.buildAuthResult(user, tokens);
  }

  /**
   * Exchange a valid refresh token for a new access + refresh token pair.
   * Implements refresh token rotation — old token is revoked.
   */
  async refreshTokens(rawRefreshToken: string): Promise<AuthTokens> {
    // 1. Verify the JWT signature / expiry
    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // 2. Look up the hashed token in the DB
    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await RefreshToken.findOne({
      userId: payload.sub,
      refreshTokenHash: tokenHash,
      isRevoked: false,
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token not found or has been revoked');
    }

    // 3. Revoke the old token (rotation)
    storedToken.isRevoked = true;
    await storedToken.save();

    // 4. Issue a new pair
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return this.issueTokens(user);
  }

  /**
   * Revoke ALL refresh tokens for a user (logout from all devices).
   */
  async logout(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  // ── Private helpers ──────────────────────────────────────

  /**
   * Generate a new access + refresh token pair and persist the refresh token hash.
   */
  private async issueTokens(user: IUser): Promise<AuthTokens> {
    const jwtPayload = { sub: (user._id as Types.ObjectId).toString(), email: user.email };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);
    console.log(accessToken, refreshToken)

    const expiresAt = new Date(
      Date.now() + parseExpiryToMs(config.jwt.refreshExpiresIn),
    );

    await RefreshToken.create({
      userId: user._id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private buildAuthResult(user: IUser, tokens: AuthTokens): AuthResult {
    return {
      user: {
        id: (user._id as Types.ObjectId).toString(),
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      tokens,
    };
  }
}

// Export singleton instance
export default new AuthService();
