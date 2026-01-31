/**
 * Validates AI-generated Three.js code before execution.
 * Whitelist approach: only allow known-safe patterns.
 */

// Forbidden patterns that indicate malicious or dangerous code
const FORBIDDEN_PATTERNS = [
  /\beval\s*\(/,
  /\bFunction\s*\(/,
  /\bimport\s*\(/,
  /\brequire\s*\(/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bcookie\b/,
  /\bpostMessage\b/,
  /\bself\[/,
  /\bglobalThis\b/,
  /\bProcess\b/,
  /\bchild_process\b/,
  /\b__proto__\b/,
  /\bconstructor\s*\[/,
];

// Required patterns - code must use these (ensures it's actually Three.js code)
const REQUIRED_PATTERNS = [
  /THREE\./,
  /(?:Primitives|Materials)\./,
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateThreeCode(code: string): ValidationResult {
  const errors: string[] = [];

  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Forbidden pattern detected: ${pattern.source}`);
    }
  }

  // Check for required patterns
  const hasRequired = REQUIRED_PATTERNS.some(p => p.test(code));
  if (!hasRequired) {
    errors.push('Code must use THREE, Primitives, or Materials');
  }

  // Length sanity check
  if (code.length > 50000) {
    errors.push('Code exceeds maximum length (50KB)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
