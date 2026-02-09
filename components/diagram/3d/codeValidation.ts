// ============================================================================
// UTILS: CODE VALIDATION (Reused from ThreeViewer)
// ============================================================================

const BLOCKED_CODE_TOKENS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bwindow\b/, label: 'window' },
  { pattern: /\bdocument\b/, label: 'document' },
  { pattern: /\blocalStorage\b/, label: 'localStorage' },
  { pattern: /\bsessionStorage\b/, label: 'sessionStorage' },
  { pattern: /\bindexedDB\b/, label: 'indexedDB' },
  { pattern: /\bfetch\b/, label: 'fetch' },
  { pattern: /\bXMLHttpRequest\b/, label: 'XMLHttpRequest' },
  { pattern: /\bWebSocket\b/, label: 'WebSocket' },
  { pattern: /\bWorker\b/, label: 'Worker' },
  { pattern: /\bnavigator\b/, label: 'navigator' },
  { pattern: /\blocation\b/, label: 'location' },
  { pattern: /\bimport\b/, label: 'import' },
  { pattern: /\brequire\b/, label: 'require' },
  { pattern: /\beval\b/, label: 'eval' },
  { pattern: /\bFunction\b/, label: 'Function' },
];

export const validateThreeCode = (code: string): string | null => {
  const trimmed = code.trim();
  if (!trimmed) return 'No 3D code provided.';
  if (!/return\s+group\s*;?/m.test(trimmed)) {
    return '3D code must end with "return group;".';
  }

  const blocked = BLOCKED_CODE_TOKENS.filter(({ pattern }) => pattern.test(trimmed)).map(
    ({ label }) => label
  );

  if (blocked.length > 0) {
    return `Blocked unsafe token(s): ${blocked.join(', ')}.`;
  }

  return null;
};
