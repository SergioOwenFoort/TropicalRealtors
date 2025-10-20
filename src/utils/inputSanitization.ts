/**
 * Input Sanitization Utility
 * Prevents XSS and injection attacks by sanitizing user input
 */

/**
 * Sanitize email input
 * Removes dangerous characters and validates format
 */
export function sanitizeEmail(email: string): string {
  // Remove whitespace
  let sanitized = email.trim().toLowerCase();
  
  // Remove any HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters except valid email chars
  sanitized = sanitized.replace(/[^a-z0-9@._\-+]/gi, '');
  
  return sanitized;
}

/**
 * Sanitize text input (names, addresses, etc.)
 * Removes HTML and dangerous characters while preserving spaces
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous characters but keep letters, numbers, spaces, basic punctuation
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
  
  // Trim and normalize whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * Sanitize phone number
 * Keeps only numbers, spaces, +, -, (, )
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Keep only valid phone number characters
  let sanitized = phone.replace(/[^0-9+\-() ]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (international)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic international phone validation
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}
