export function isCaptchaConfigured(): boolean {
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
  return !!siteKey;
}

export function getCaptchaSiteKey(): string | undefined {
  return import.meta.env.VITE_HCAPTCHA_SITE_KEY;
}

export function validateCaptchaToken(token: string): boolean {
  return !!token && token.length > 0;
}

export async function requireCaptcha(token: string): Promise<boolean> {
  return validateCaptchaToken(token);
}
