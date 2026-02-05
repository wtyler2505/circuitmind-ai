# Phase 3: Security Audit Report

**Generated:** 2026-01-31 14:02
**Project:** CircuitMind AI
**Scope:** Full security analysis including secrets detection, XSS vectors, code injection, npm vulnerabilities

---

## Executive Summary

| Severity | Count |
|----------|-------|
| **CRITICAL** | 1 |
| **HIGH** | 3 |
| **MEDIUM** | 5 |
| **LOW** | 9 |

---

## CRITICAL Issues

### SEC-001: Code Injection via `new Function()` in Web Worker

- **Severity:** CRITICAL
- **Location:** `/home/wtyler/circuitmind-ai/services/threeCodeRunner.worker.ts:46`
- **Issue:** Direct execution of AI-generated code using `new Function()` constructor
- **Code:**
```typescript
const createMesh = new Function('THREE', 'Primitives', 'Materials', code);
const componentGroup = createMesh(THREE, Primitives, Materials);
```
- **Risk:** The `code` parameter comes from AI model output (gemini) and is executed directly. A malicious or manipulated AI response could:
  - Execute arbitrary JavaScript in the worker context
  - Access `self` and `postMessage` to exfiltrate data
  - Perform prototype pollution attacks
  - Crash the worker or main thread
- **Current Mitigation:** Worker runs in isolated context, but still has access to THREE.js and can communicate with main thread
- **Recommendation:**
  1. Implement a strict code sanitizer/validator before execution
  2. Use a sandboxed iframe with no-cors instead of a worker
  3. Implement CSP for the worker
  4. Consider using a proper JavaScript parser (esprima/acorn) to validate AST before execution
  5. Whitelist allowed function calls and object access patterns

---

## HIGH Issues

### SEC-002: XSS via `dangerouslySetInnerHTML` with SVG Content

- **Severity:** HIGH
- **Location:** `/home/wtyler/circuitmind-ai/components/diagram/parts/FzpzVisual.tsx:87`
- **Issue:** SVG content from FZPZ files is directly injected into the DOM without sanitization
- **Code:**
```typescript
<g 
  className="fzpz-content"
  dangerouslySetInnerHTML={{ __html: innerContent }}
/>
```
- **Risk:** FZPZ files are ZIP archives containing SVG. Malicious SVG can contain:
  - `<script>` tags with executable JavaScript
  - Event handlers (`onload`, `onclick`, `onerror`)
  - External resource references (`<use href="...">`)
  - CSS-based attacks
- **Recommendation:**
  1. Use DOMPurify to sanitize SVG content before injection
  2. Strip all event handlers from SVG
  3. Remove `<script>` tags and `javascript:` URIs
  4. Validate SVG content against a whitelist schema

### SEC-003: Insecure HTTP for Peer Discovery

- **Severity:** HIGH
- **Location:** Multiple files:
  - `/home/wtyler/circuitmind-ai/services/syncService.ts:39,53`
  - `/home/wtyler/circuitmind-ai/services/peerDiscoveryService.ts:54`
- **Issue:** Local network peer communication uses unencrypted HTTP
- **Code:**
```typescript
const url = `http://${peer.lastIp}:3000/git`;
const response = await fetch(`http://${peer.lastIp}:3000/ping`, { timeout: 2000 });
```
- **Risk:**
  - Man-in-the-middle attacks on local network
  - Data interception during sync
  - Potential for DNS rebinding attacks
- **Recommendation:**
  1. Use HTTPS with self-signed certificates for local peers
  2. Implement mutual TLS authentication
  3. Add request signing with shared secrets
  4. Validate peer identity before sending data

### SEC-004: API Key Storage in localStorage

- **Severity:** HIGH
- **Location:** `/home/wtyler/circuitmind-ai/services/gemini/client.ts:16`
- **Issue:** API keys stored in browser localStorage without encryption
- **Code:**
```typescript
const apiKey = localStorage.getItem('cm_gemini_api_key') || process.env.API_KEY;
```
- **Risk:**
  - XSS attacks can steal API keys
  - Keys persist across sessions
  - Browser extensions can access localStorage
  - Keys exposed in dev tools
- **Recommendation:**
  1. Store API keys in httpOnly cookies (if backend available)
  2. Use session-only storage (sessionStorage)
  3. Encrypt keys before storage
  4. Implement key rotation mechanism
  5. Consider server-side proxy for API calls

---

## MEDIUM Issues

### SEC-005: Token Generation with Weak Randomness

- **Severity:** MEDIUM
- **Location:** `/home/wtyler/circuitmind-ai/services/api/tokenService.ts:35`
- **Issue:** API tokens generated using `Math.random()` which is not cryptographically secure
- **Code:**
```typescript
secret: `cm_${Math.random().toString(36).substr(2, 16)}`,
```
- **Risk:** Predictable tokens could be brute-forced or guessed
- **Recommendation:** Use `crypto.randomUUID()` or `crypto.getRandomValues()`

### SEC-006: innerHTML Usage in Utility Function

- **Severity:** MEDIUM
- **Location:** `/home/wtyler/circuitmind-ai/services/responseParser.ts:269`
- **Issue:** Uses `div.innerHTML` for HTML escaping, which is non-standard
- **Code:**
```typescript
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```
- **Risk:** While this specific pattern is safe (textContent -> innerHTML), it's fragile and could be misused
- **Recommendation:** Use a standard escaping library or explicit character replacement

### SEC-007: No Input Validation on WebRTC Signaling

- **Severity:** MEDIUM
- **Location:** `/home/wtyler/circuitmind-ai/services/webRTCService.ts:20,39`
- **Issue:** `JSON.parse()` on untrusted WebRTC signaling data without validation
- **Code:**
```typescript
const offer = JSON.parse(offerStr);
const answer = JSON.parse(answerStr);
```
- **Risk:** Prototype pollution or DoS via malformed JSON
- **Recommendation:** Validate parsed objects against expected schema

### SEC-008: PIN Storage with Client-Side Hashing

- **Severity:** MEDIUM
- **Location:** `/home/wtyler/circuitmind-ai/services/authService.ts:60-61`
- **Issue:** PIN is hashed and stored in localStorage, but security depends entirely on client
- **Risk:** 
  - PIN can be bypassed by manipulating localStorage
  - Rainbow table attacks on weak PINs
- **Recommendation:** 
  1. Use stronger key derivation (PBKDF2 with higher iterations)
  2. Consider server-side authentication

### SEC-009: Missing Origin Validation in postMessage Handlers

- **Severity:** MEDIUM
- **Location:** Multiple worker files:
  - `/home/wtyler/circuitmind-ai/services/threeCodeRunner.worker.ts`
  - `/home/wtyler/circuitmind-ai/services/gesture/GestureEngine.ts`
- **Issue:** `self.onmessage` handlers don't validate message origin
- **Risk:** If worker is somehow accessible, malicious scripts could send messages
- **Recommendation:** Validate `event.origin` in message handlers

---

## LOW Issues

### SEC-010: gitleaks False Positives (Not Real Secrets)

- **Severity:** LOW (False Positive)
- **Location:** Git history - deleted docs
- **Issue:** gitleaks detected 3 "secrets" that are actually snake_case identifiers with underscores
- **Detected:**
  - `hcsr04_distance` - ultrasonic sensor project name
  - `esp32_ultrasonic` - ESP32 project name
  - `ws2812b_rainbow` - LED project name
- **Risk:** None - these are project/function names, not secrets
- **Recommendation:** Add `.gitleaks.toml` allowlist for these patterns

### SEC-011: npm Audit Vulnerabilities (9 Low Severity)

- **Severity:** LOW
- **Issue:** 9 low-severity vulnerabilities in dependencies
- **Affected Packages:**
  1. `diff` (6.0.0-8.0.2) - DoS vulnerability in `parsePatch`/`applyPatch`
     - Via: `@google/gemini-cli`, `@google/gemini-cli-core`
  2. `elliptic` (*) - Cryptographic implementation risk
     - Via: `vite-plugin-node-polyfills` → `crypto-browserify` → `browserify-sign`
- **Risk:** 
  - `diff`: DoS if processing malicious patch files
  - `elliptic`: Theoretical crypto weakness
- **Recommendation:**
  1. Run `npm audit fix` for safe upgrades
  2. Evaluate if `vite-plugin-node-polyfills` is needed
  3. Pin versions to avoid future vulnerabilities

### SEC-012: .env.local Not in .gitignore

- **Severity:** LOW
- **Location:** `.gitignore`
- **Issue:** Only `.env` is in gitignore, but `.env.local` exists
- **Files Present:**
  - `.env` (176 bytes)
  - `.env.local` (55 bytes) - NOT ignored by `.env` pattern
- **Risk:** `.env.local` could accidentally be committed
- **Recommendation:** Add `.env.local` and `.env.*` to `.gitignore` (note: `*.local` IS in gitignore)

### SEC-013: localStorage Usage for Sensitive Data

- **Severity:** LOW
- **Locations:** 30+ usages across services
- **Issue:** Various sensitive data stored in localStorage:
  - API tokens (`cm_api_tokens`)
  - PIN hash (`cm_pin_hash`)
  - User profiles
  - Audit logs
- **Risk:** Data persists and is accessible to XSS
- **Recommendation:** Evaluate which data truly needs persistence vs sessionStorage

### SEC-014: No CSRF Protection on API Routes

- **Severity:** LOW
- **Location:** `/home/wtyler/circuitmind-ai/services/api/events.ts`
- **Issue:** Internal API endpoints lack CSRF tokens
- **Risk:** Limited - only internal webhooks, but could be exploited if exposed
- **Recommendation:** Add CSRF tokens for state-changing operations

### SEC-015: JSON.parse Without Try-Catch in Some Locations

- **Severity:** LOW
- **Locations:** Multiple services
- **Issue:** Some `JSON.parse()` calls don't handle errors gracefully
- **Risk:** Uncaught exceptions could crash components
- **Recommendation:** Wrap all `JSON.parse()` in try-catch

### SEC-016: no-cors Mode Used for Connectivity Check

- **Severity:** LOW
- **Location:** `/home/wtyler/circuitmind-ai/services/connectivityService.ts:37`
- **Issue:** Uses `mode: 'no-cors'` which limits error handling
- **Risk:** Cannot properly handle response errors
- **Recommendation:** Use proper CORS if server supports it

### SEC-017: Hardcoded Port Numbers

- **Severity:** LOW
- **Locations:** 
  - `services/syncService.ts` (port 3000)
  - `services/peerDiscoveryService.ts` (port 3000)
- **Issue:** Port 3000 hardcoded for peer communication
- **Risk:** Inflexible configuration, potential port conflicts
- **Recommendation:** Make ports configurable via environment variables

### SEC-018: Missing Rate Limiting

- **Severity:** LOW
- **Location:** All API and AI interaction points
- **Issue:** No apparent rate limiting on AI requests or API calls
- **Risk:** 
  - API quota exhaustion
  - Denial of service potential
- **Recommendation:** Implement client-side rate limiting for AI calls

---

## Security Best Practices Assessment

| Practice | Status | Notes |
|----------|--------|-------|
| **No eval()** | ✅ PASS | No direct eval() usage found |
| **No document.cookie** | ✅ PASS | Only reference is in security test |
| **No document.write** | ✅ PASS | No usage found |
| **Secrets in .env** | ✅ PASS | .env properly gitignored |
| **HTTPS for external** | ✅ PASS | External APIs use HTTPS |
| **No hardcoded secrets** | ✅ PASS | Keys read from env/storage |
| **XSS Protection** | ⚠️ PARTIAL | dangerouslySetInnerHTML needs sanitization |
| **Code Injection** | ❌ FAIL | new Function() with AI code |
| **Secure Randomness** | ⚠️ PARTIAL | Some uses of Math.random() |
| **Input Validation** | ⚠️ PARTIAL | JSON parsing lacks schema validation |

---

## Immediate Actions Required

### Priority 1 (Do Now)
1. **SEC-001:** Add sanitizer for AI-generated 3D code before `new Function()` execution
2. **SEC-002:** Add DOMPurify for SVG content in FzpzVisual

### Priority 2 (This Week)
3. **SEC-003:** Document HTTP peer discovery as local-only, add TLS option
4. **SEC-004:** Migrate API key to sessionStorage or encrypted storage
5. **SEC-005:** Replace `Math.random()` with `crypto.randomUUID()`

### Priority 3 (This Sprint)
6. Run `npm audit fix` to resolve dependency vulnerabilities
7. Add comprehensive `.gitleaks.toml` allowlist
8. Add schema validation for JSON.parse on external data

---

## gitleaks Raw Output

```
Saved to: /home/wtyler/circuitmind-ai/audits/2026-01-31_1355_extreme-audit/reports/gitleaks.txt

Finding: hcsr04_distance - FALSE POSITIVE (project name)
Finding: esp32_ultrasonic - FALSE POSITIVE (project name)  
Finding: ws2812b_rainbow - FALSE POSITIVE (project name)

All 3 findings are false positives - snake_case project identifiers mistaken for API keys.
155 commits scanned, ~141MB analyzed in 66 seconds.
```

---

## npm audit Summary

```
9 low severity vulnerabilities

Affected:
- diff 6.0.0-8.0.2 (DoS vulnerability)
  - @google/gemini-cli, @google/gemini-cli-core
- elliptic * (Crypto implementation risk)
  - vite-plugin-node-polyfills chain

Fix: npm audit fix --force (breaking changes)
```

---

## Conclusion

The codebase has **1 CRITICAL** and **3 HIGH** severity issues requiring immediate attention. The most serious is the `new Function()` code execution with AI-generated content (SEC-001), which could allow code injection. The `dangerouslySetInnerHTML` with unsanitized SVG (SEC-002) is also exploitable.

Most low-severity findings are architectural decisions (localStorage usage, HTTP for local peers) that are acceptable for a local-first application but should be documented.

**Overall Security Posture:** MODERATE - requires remediation of CRITICAL/HIGH issues before production use.
