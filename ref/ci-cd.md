# CircuitMind AI - CI/CD Reference

## GitHub Actions Workflows

### Security Scanning (`.github/workflows/security.yml`)

**Triggers**: Push to `master`, Pull requests to `master`
**Permissions**: Read-only contents

#### Job 1: Secret Detection (`gitleaks`)

- **Runner**: ubuntu-latest
- **Steps**:
  1. Checkout with full history (`fetch-depth: 0`)
  2. Run gitleaks via `gitleaks/gitleaks-action@v2`
- **Config**: Uses `.gitleaks.toml` at project root
- **Purpose**: Detects accidentally committed secrets (API keys, tokens, passwords)

#### Job 2: Dependency Audit (`audit`)

- **Runner**: ubuntu-latest
- **Steps**:
  1. Checkout
  2. Setup Node.js 20 with npm cache
  3. `npm ci` (clean install)
  4. `npm audit --audit-level=high` -- fails on HIGH/CRITICAL vulnerabilities
  5. `npm audit --json > security-report.json` -- generates JSON report (always runs, continue-on-error)
  6. Upload `security-report.json` as artifact (30-day retention)

## Pre-Commit Hooks

### Secret Detection (`scripts/hooks/pre-commit`)

Installed via the `prepare` npm script in `package.json`, which copies `scripts/hooks/pre-commit` to `.git/hooks/pre-commit`.

**Behavior**:
1. Checks if `gitleaks` is installed
   - If not installed: prints warning and skips (exit 0)
2. Scans staged changes using `gitleaks git --pre-commit`
3. If secrets detected: blocks commit (exit 1) with remediation steps
4. If clean: allows commit (exit 0)

**Configuration**: Uses `.gitleaks.toml` at project root.

**Bypass** (not recommended): `git commit --no-verify`

### Hook Installation

Hooks are installed automatically via `npm install` (the `prepare` script):

```json
{
  "prepare": "node -e \"...cpSync('scripts/hooks/pre-commit', '.git/hooks/pre-commit')...\""
}
```

This copies the pre-commit hook and sets executable permissions (0o755).

Manual installation:
```bash
bash scripts/install-hooks.sh
```

## Available npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server (port 3000) |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Run tests in watch mode |
| `lint` | `eslint . --ext .ts,.tsx` | Check lint issues |
| `lint:fix` | `eslint . --ext .ts,.tsx --fix` | Auto-fix lint issues |
| `format` | `prettier --write "**/*.{ts,tsx,json,css,md}"` | Format all files |
| `format:check` | `prettier --check "**/*.{ts,tsx,json,css,md}"` | Check formatting |
| `test:visual` | `playwright test scripts/capture-screenshots.ts` | Playwright visual tests |
| `prepare` | (inline script) | Install git hooks on npm install |

## Testing Infrastructure

### Unit Tests

- **Framework**: Vitest 4.x
- **Environment**: jsdom
- **Setup**: `tests/setup.tsx`
- **Test count**: 226 tests across 22 suites (as of latest)
- **Run**: `npm test` or `npm run test:watch`

### Visual Tests

- **Framework**: Playwright
- **Script**: `scripts/capture-screenshots.ts`
- **Run**: `npm run test:visual`

### Type Checking

```bash
npx tsc --noEmit   # Check TypeScript with no output
```

This is the primary validation before committing -- ensures zero type errors.

## Recommended CI/CD Pipeline

For a complete pipeline, consider adding these steps (not currently automated):

```yaml
# Suggested additions
- npm run lint          # ESLint check
- npm run format:check  # Prettier check
- npx tsc --noEmit      # TypeScript validation
- npm test              # Unit tests
- npm run build         # Build verification
```

## Security Tools

| Tool | Purpose | Where |
|------|---------|-------|
| gitleaks | Secret scanning | Pre-commit hook + CI workflow |
| npm audit | Dependency vulnerabilities | CI workflow |
| Zod | Input validation | Server routes (runtime) |
| securityHeaders middleware | HTTP security headers | Server (runtime) |
| `.gitleaks.toml` | Secret patterns config | Project root |
| `securityAuditor.ts` | Client-side security audit service | `services/securityAuditor.ts` |
