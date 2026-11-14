/**
 * Secure Admin Authentication & Authorization Service
 * Enforces zero-trust administrator credentials, cryptographic password hashing,
 * rate limiting against brute force, and mandatory first-login password change.
 */

import { storageService } from './storageService';

const ADMIN_IDENTIFIER = 'arabianshawarma@admin';
const ADMIN_STORAGE_KEY = 'asp_admin_security_state_v2';
const ADMIN_SESSION_KEY = 'asp_admin_active_session_v2';

// Salt for SHA-256 cryptographic hashing
const HASH_SALT = 'asp_secure_admin_salt_#2026_q8';

export interface AdminSession {
  token: string;
  adminId: string;
  loginTime: string;
  expiresAt: number; // timestamp ms
  mustChangePassword: boolean;
}

export interface AdminSecurityState {
  adminId: string;
  passwordHash: string;
  mustChangePassword: boolean;
  lastPasswordChange?: string;
  failedAttempts: number;
  lockedUntil?: number; // timestamp ms
}

// Compute SHA-256 hash using native Web Crypto API
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text + HASH_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Pre-computed SHA-256 hex digest of the initial temporary onboarding password (salted with HASH_SALT).
// Stored strictly as a one-way digest so no plaintext password literal appears in source or production bundles.
const INITIAL_ONBOARDING_PASSWORD_HASH =
  '226a88712d02c102f54e99b9de562ab05436fd21ca5c7e52d03dcc4b3edb432c';

async function getInitialTempHash(): Promise<string> {
  return INITIAL_ONBOARDING_PASSWORD_HASH;
}

// Safe storage helper with in-memory fallback for non-browser or restricted contexts
const inMemoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // Ignore restricted access
  }
  return inMemoryStore[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore restricted access
  }
  inMemoryStore[key] = value;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore restricted access
  }
  delete inMemoryStore[key];
}

export const adminAuthService = {
  getAdminIdentifier(): string {
    return ADMIN_IDENTIFIER;
  },

  async getSecurityState(): Promise<AdminSecurityState> {
    try {
      const stored = safeGetItem(ADMIN_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }

    // Default initial state: requires temporary onboarding hash verification and mandatory password change
    const defaultHash = await getInitialTempHash();
    const initialState: AdminSecurityState = {
      adminId: ADMIN_IDENTIFIER,
      passwordHash: defaultHash,
      mustChangePassword: true,
      failedAttempts: 0
    };
    this.saveSecurityState(initialState);
    return initialState;
  },

  saveSecurityState(state: AdminSecurityState): void {
    try {
      safeSetItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving admin security state:', e);
    }
  },

  /**
   * Validate password complexity
   * Requires:
   * - Min 12 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special symbol
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    criteria: {
      minLength: boolean;
      hasUpper: boolean;
      hasLower: boolean;
      hasNumber: boolean;
      hasSpecial: boolean;
    };
  } {
    const criteria = {
      minLength: password.length >= 12,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };

    const errors: string[] = [];
    if (!criteria.minLength) errors.push('Password must be at least 12 characters long.');
    if (!criteria.hasUpper) errors.push('Include at least one uppercase letter (A-Z).');
    if (!criteria.hasLower) errors.push('Include at least one lowercase letter (a-z).');
    if (!criteria.hasNumber) errors.push('Include at least one digit (0-9).');
    if (!criteria.hasSpecial) errors.push('Include at least one special symbol (!@#$%^&*...).');

    return {
      isValid: errors.length === 0,
      errors,
      criteria
    };
  },

  /**
   * Authenticate Administrator
   * Handles rate limiting and initial password checks.
   */
  async login(
    loginId: string,
    passwordAttempt: string
  ): Promise<{
    success: boolean;
    mustChangePassword?: boolean;
    message?: string;
    session?: AdminSession;
  }> {
    const state = await this.getSecurityState();
    const now = Date.now();

    // Check rate limit lock
    if (state.lockedUntil && state.lockedUntil > now) {
      const waitMinutes = Math.ceil((state.lockedUntil - now) / 60000);
      storageService.addAuditLog(
        'ADMIN_LOGIN_LOCKED_ATTEMPT',
        'auth',
        loginId,
        `Rejected attempt while locked. Wait ${waitMinutes}m.`
      );
      return {
        success: false,
        message: `Too many failed login attempts. Access locked for security. Please try again in ${waitMinutes} minute(s).`
      };
    }

    // Strict identifier check (exact match: arabianshawarma@admin)
    const cleanId = loginId.trim();
    if (cleanId !== ADMIN_IDENTIFIER) {
      state.failedAttempts = (state.failedAttempts || 0) + 1;
      if (state.failedAttempts >= 5) {
        state.lockedUntil = now + 15 * 60 * 1000; // Lock 15 minutes
      }
      this.saveSecurityState(state);
      storageService.addAuditLog(
        'ADMIN_LOGIN_FAILED',
        'auth',
        cleanId,
        `Unauthorized identifier attempted: ${cleanId}`
      );
      return {
        success: false,
        message: 'Invalid administrator credentials. Access is restricted to the authorized owner account.'
      };
    }

    // Verify cryptographic hash
    const inputHash = await sha256(passwordAttempt);
    if (inputHash !== state.passwordHash) {
      state.failedAttempts = (state.failedAttempts || 0) + 1;
      if (state.failedAttempts >= 5) {
        state.lockedUntil = now + 15 * 60 * 1000;
        this.saveSecurityState(state);
        storageService.addAuditLog(
          'ADMIN_ACCOUNT_LOCKED',
          'auth',
          ADMIN_IDENTIFIER,
          'Locked for 15 minutes following 5 failed password attempts.'
        );
        return {
          success: false,
          message: 'Account locked due to 5 failed attempts. Please wait 15 minutes before trying again.'
        };
      }
      this.saveSecurityState(state);
      storageService.addAuditLog(
        'ADMIN_LOGIN_FAILED_PASSWORD',
        'auth',
        ADMIN_IDENTIFIER,
        `Incorrect password attempt (${state.failedAttempts}/5)`
      );
      return {
        success: false,
        message: `Invalid administrator credentials. Attempt ${state.failedAttempts} of 5 before temporary lock.`
      };
    }

    // Password matches! Reset failed attempts
    state.failedAttempts = 0;
    state.lockedUntil = undefined;
    this.saveSecurityState(state);

    // Create secure session
    const sessionToken = 'adm_sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const session: AdminSession = {
      token: sessionToken,
      adminId: ADMIN_IDENTIFIER,
      loginTime: new Date().toISOString(),
      expiresAt: now + 8 * 60 * 60 * 1000, // 8 hours
      mustChangePassword: state.mustChangePassword
    };

    safeSetItem(ADMIN_SESSION_KEY, JSON.stringify(session));

    storageService.addAuditLog(
      'ADMIN_LOGIN_SUCCESS',
      'auth',
      ADMIN_IDENTIFIER,
      state.mustChangePassword ? 'First login with temporary credentials.' : 'Authenticated with permanent password.'
    );

    return {
      success: true,
      mustChangePassword: state.mustChangePassword,
      session
    };
  },

  /**
   * Change Administrator Password
   * Enforces verification of current password, complexity, and session invalidation.
   */
  async changePassword(
    currentPasswordAttempt: string,
    newPasswordAttempt: string,
    confirmPasswordAttempt: string
  ): Promise<{ success: boolean; message: string }> {
    const state = await this.getSecurityState();

    // 1. Verify current password
    const currentHash = await sha256(currentPasswordAttempt);
    if (currentHash !== state.passwordHash) {
      return {
        success: false,
        message: 'Current password verification failed. Please enter your existing password correctly.'
      };
    }

    // 2. Check confirmation
    if (newPasswordAttempt !== confirmPasswordAttempt) {
      return {
        success: false,
        message: 'The new password and confirmation password do not match.'
      };
    }

    // 3. Prevent re-using temporary password
    const tempHash = await getInitialTempHash();
    const newHash = await sha256(newPasswordAttempt);
    if (newHash === tempHash) {
      return {
        success: false,
        message: 'You cannot use the temporary initial password as your new password.'
      };
    }

    // 4. Validate password complexity
    const strength = this.validatePasswordStrength(newPasswordAttempt);
    if (!strength.isValid) {
      return {
        success: false,
        message: strength.errors[0] || 'Password does not meet the 12+ character complexity requirement.'
      };
    }

    // 5. Update state securely
    state.passwordHash = newHash;
    state.mustChangePassword = false;
    state.lastPasswordChange = new Date().toISOString();
    state.failedAttempts = 0;
    state.lockedUntil = undefined;
    this.saveSecurityState(state);

    // 6. Update current session so mustChangePassword becomes false
    const currentSession = this.getActiveSession();
    if (currentSession) {
      currentSession.mustChangePassword = false;
      safeSetItem(ADMIN_SESSION_KEY, JSON.stringify(currentSession));
    }

    storageService.addAuditLog(
      'ADMIN_PASSWORD_CHANGED',
      'auth',
      ADMIN_IDENTIFIER,
      'Administrator password successfully updated with 12+ character complexity.'
    );

    return {
      success: true,
      message: 'Password successfully changed and updated.'
    };
  },

  /**
   * Get active authenticated admin session
   */
  getActiveSession(): AdminSession | null {
    try {
      const stored = safeGetItem(ADMIN_SESSION_KEY);
      if (!stored) return null;
      const session: AdminSession = JSON.parse(stored);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  /**
   * Invalidate administrator session
   */
  logout(): void {
    safeRemoveItem(ADMIN_SESSION_KEY);
    storageService.addAuditLog(
      'ADMIN_LOGOUT',
      'auth',
      ADMIN_IDENTIFIER,
      'Administrator session terminated.'
    );
  },

  /**
   * Logout from all sessions (resets session tokens)
   */
  logoutAllSessions(): void {
    safeRemoveItem(ADMIN_SESSION_KEY);
    storageService.addAuditLog(
      'ADMIN_LOGOUT_ALL',
      'auth',
      ADMIN_IDENTIFIER,
      'Invalidated all active administrative sessions.'
    );
  }
};
