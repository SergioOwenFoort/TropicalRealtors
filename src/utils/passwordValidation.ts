/**
 * Password Validation Utility
 * Enforces strong password requirements to prevent weak passwords
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  // Check minimum length
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Wachtwoord moet minimaal ${PASSWORD_MIN_LENGTH} tekens bevatten`);
  }

  // Check maximum length
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Wachtwoord mag maximaal ${PASSWORD_MAX_LENGTH} tekens bevatten`);
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één hoofdletter bevatten');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één kleine letter bevatten');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één cijfer bevatten');
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één speciaal teken bevatten (!@#$%^&* etc.)');
  }

  // Check for common weak passwords
  const weakPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'letmein', 'welcome', 'monkey', '111111', 'password1',
    'wachtwoord', 'welkom', 'admin', 'administrator'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('Dit wachtwoord is te eenvoudig en wordt vaak gebruikt');
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('Wachtwoord mag geen opeenvolgende tekens bevatten (abc, 123, etc.)');
  }

  // Calculate password strength
  if (errors.length === 0) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 12;

    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars, isLongEnough]
      .filter(Boolean).length;

    if (criteriaCount >= 5) {
      strength = 'strong';
    } else if (criteriaCount >= 4) {
      strength = 'medium';
    } else {
      strength = 'weak';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Simple password strength indicator for UI
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'strong':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'weak':
      return 'text-red-600';
  }
}

export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'strong':
      return 'Sterk wachtwoord';
    case 'medium':
      return 'Gemiddeld wachtwoord';
    case 'weak':
      return 'Zwak wachtwoord';
  }
}
