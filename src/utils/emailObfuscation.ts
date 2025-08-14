/**
 * Utility functions for obfuscating email addresses to make them less readable to bots
 * while still being accessible to real users
 */

/**
 * Obfuscates an email address by replacing characters with asterisks
 * Example: john.doe@example.com -> j***.*e@e*****e.com
 */
export function obfuscateEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email;
  }

  const [localPart, domain] = email.split('@');
  
  // Obfuscate local part (before @)
  const obfuscatedLocal = obfuscateString(localPart);
  
  // Obfuscate domain part
  const obfuscatedDomain = obfuscateDomain(domain);
  
  return `${obfuscatedLocal}@${obfuscatedDomain}`;
}

/**
 * Obfuscates a string by showing first and last character, replacing middle with asterisks
 */
function obfuscateString(str: string): string {
  if (str.length <= 2) {
    return str;
  }
  
  if (str.length <= 4) {
    return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
  }
  
  // For longer strings, show first 2 and last 1 characters
  const start = str.substring(0, 2);
  const end = str.substring(str.length - 1);
  const middle = '*'.repeat(Math.max(1, str.length - 3));
  
  return start + middle + end;
}

/**
 * Obfuscates a domain by partially hiding the domain name but keeping the TLD visible
 */
function obfuscateDomain(domain: string): string {
  const parts = domain.split('.');
  
  if (parts.length === 1) {
    return obfuscateString(parts[0]);
  }
  
  // Obfuscate all parts except the TLD (last part)
  const obfuscatedParts = parts.map((part, index) => {
    if (index === parts.length - 1) {
      // Keep TLD visible
      return part;
    }
    return obfuscateString(part);
  });
  
  return obfuscatedParts.join('.');
}

/**
 * Creates a React component that reveals the email on click/hover
 * This returns the obfuscated email and a click handler
 */
export function createRevealableEmail(email: string) {
  const obfuscated = obfuscateEmail(email);
  
  return {
    obfuscated,
    original: email,
    isObfuscated: obfuscated !== email
  };
}

/**
 * Alternative obfuscation using HTML entities (for additional protection)
 */
export function htmlObfuscateEmail(email: string): string {
  return email
    .split('')
    .map(char => {
      // Randomly decide whether to encode this character
      if (Math.random() > 0.5 && char.match(/[a-zA-Z@.]/)) {
        return `&#${char.charCodeAt(0)};`;
      }
      return char;
    })
    .join('');
}
