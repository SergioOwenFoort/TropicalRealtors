/**
 * hCaptcha Client-Side Utility
 * 
 * IMPORTANT: hCaptcha verification MUST be done server-side using a Netlify Function
 * or backend API. The secret key should NEVER be exposed in frontend code.
 * 
 * This file only provides client-side helpers for checking if hCaptcha is configured.
 * Actual verification should happen in your backend (e.g., netlify/functions/).
 */

/**
 * Check if hCaptcha site key is configured
 * Only the SITE KEY should be in the frontend, never the SECRET KEY
 */
export function isCaptchaConfigured(): boolean {
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
  return !!siteKey;
}

/**
 * Get the hCaptcha site key (safe to use in frontend)
 */
export function getCaptchaSiteKey(): string | undefined {
  return import.meta.env.VITE_HCAPTCHA_SITE_KEY;
}

/**
 * Client-side validation helper
 * This only checks if a token exists - actual verification MUST be done server-side
 */
export function validateCaptchaToken(token: string): boolean {
  return !!token && token.length > 0;
}
