/**
 * hCaptcha Server-Side Verification Utility
 * Verifies hCaptcha tokens on the server side for maximum security
 */

const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';

interface VerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  'error-codes'?: string[];
  score?: number;
  score_reason?: string[];
}

/**
 * Verify hCaptcha token on the server side
 * This should be called from a secure backend/serverless function
 * 
 * @param token - The hCaptcha response token from the client
 * @param remoteIp - Optional: The user's IP address for additional verification
 * @returns Promise<boolean> - True if verification succeeds
 */
export async function verifyCaptchaToken(
  token: string, 
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = import.meta.env.VITE_HCAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('VITE_HCAPTCHA_SECRET_KEY not configured');
    return { success: false, error: 'Server configuration error' };
  }

  if (!token) {
    return { success: false, error: 'No captcha token provided' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: VerifyResponse = await response.json();

    if (!data.success) {
      const errorCodes = data['error-codes'] || [];
      console.error('hCaptcha verification failed:', errorCodes);
      
      // Common error codes
      const errorMessages: Record<string, string> = {
        'missing-input-secret': 'Server configuration error',
        'invalid-input-secret': 'Server configuration error',
        'missing-input-response': 'CAPTCHA not completed',
        'invalid-input-response': 'Invalid CAPTCHA response',
        'bad-request': 'Invalid request',
        'invalid-or-already-seen-response': 'CAPTCHA already used',
        'timeout-or-duplicate': 'CAPTCHA expired or duplicate'
      };

      const errorMessage = errorCodes
        .map(code => errorMessages[code] || 'Verification failed')
        .join(', ');

      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Verification failed' 
    };
  }
}

/**
 * Middleware-style verification for form submissions
 * Returns true if verified, false otherwise
 */
export async function requireCaptcha(token: string): Promise<boolean> {
  const result = await verifyCaptchaToken(token);
  
  if (!result.success) {
    console.error('CAPTCHA verification failed:', result.error);
    return false;
  }
  
  return true;
}

/**
 * Check if hCaptcha is properly configured
 */
export function isCaptchaConfigured(): boolean {
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
  const secretKey = import.meta.env.VITE_HCAPTCHA_SECRET_KEY;
  
  return !!(siteKey && secretKey);
}
