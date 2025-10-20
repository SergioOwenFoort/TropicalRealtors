/**
 * Client-side Rate Limiter
 * Prevents brute force attacks by limiting login attempts
 * Note: This is a client-side implementation. For production, implement server-side rate limiting.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes lockout after max attempts

/**
 * Check if an action is allowed based on rate limiting
 */
export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number; attemptsLeft?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    // First attempt
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now
    });
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS - 1 };
  }

  // Check if user is currently locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    const retryAfter = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Check if the window has expired
  if (now - entry.firstAttempt > WINDOW_MS) {
    // Reset the counter
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now
    });
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS - 1 };
  }

  // Check if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    // Lock the user out
    entry.lockedUntil = now + LOCKOUT_MS;
    rateLimitStore.set(identifier, entry);
    const retryAfter = Math.ceil(LOCKOUT_MS / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment attempts
  entry.attempts += 1;
  rateLimitStore.set(identifier, entry);
  
  return { allowed: true, attemptsLeft: MAX_ATTEMPTS - entry.attempts };
}

/**
 * Record a successful action (resets the counter)
 */
export function recordSuccess(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get remaining attempts for an identifier
 */
export function getRemainingAttempts(identifier: string): number {
  const entry = rateLimitStore.get(identifier);
  if (!entry) return MAX_ATTEMPTS;
  
  const now = Date.now();
  
  // If window expired, return max attempts
  if (now - entry.firstAttempt > WINDOW_MS) {
    return MAX_ATTEMPTS;
  }
  
  return Math.max(0, MAX_ATTEMPTS - entry.attempts);
}

/**
 * Format time remaining for user display
 */
export function formatRetryAfter(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'}${remainingSeconds > 0 ? ` en ${remainingSeconds} seconden` : ''}`;
  }
  
  return `${seconds} ${seconds === 1 ? 'seconde' : 'seconden'}`;
}

/**
 * Clear rate limit for testing purposes (use sparingly)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
