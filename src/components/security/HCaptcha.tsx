import React, { useRef, useCallback } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'invisible';
}

/**
 * HCaptcha Component Wrapper
 * Provides CAPTCHA verification for forms to prevent bots and abuse
 * 
 * Usage:
 * <HCaptchaComponent 
 *   onVerify={(token) => setCaptchaToken(token)} 
 *   onExpire={() => setCaptchaToken('')}
 * />
 */
export function HCaptchaComponent({ 
  onVerify, 
  onExpire, 
  onError,
  theme = 'light',
  size = 'normal'
}: HCaptchaComponentProps) {
  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  // Handle verification
  const handleVerify = useCallback((token: string) => {
    onVerify(token);
  }, [onVerify]);

  // Handle expiration
  const handleExpire = useCallback(() => {
    if (onExpire) {
      onExpire();
    }
  }, [onExpire]);

  // Handle errors
  const handleError = useCallback((err: string) => {
    console.error('hCaptcha error:', err);
    if (onError) {
      onError(err);
    }
  }, [onError]);

  // Validate site key
  if (!siteKey) {
    console.warn('VITE_HCAPTCHA_SITE_KEY not configured. hCaptcha will not be displayed.');
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        ⚠️ CAPTCHA niet geconfigureerd. Neem contact op met de beheerder.
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={handleVerify}
        onExpire={handleExpire}
        onError={handleError}
        theme={theme}
        size={size}
      />
    </div>
  );
}

/**
 * Reset hCaptcha widget
 * Use this function to reset the captcha after form submission
 */
export function resetCaptcha(captchaRef: React.RefObject<HCaptcha>) {
  if (captchaRef.current) {
    captchaRef.current.resetCaptcha();
  }
}
