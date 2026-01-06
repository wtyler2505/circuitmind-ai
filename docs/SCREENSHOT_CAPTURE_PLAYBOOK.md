# Screenshot Capture Playbook

This is the reliable way to refresh the UI audit screenshots without pain.

## Why This Exists
- The audit is only as good as the screenshots.
- Playwright can fail in restricted environments (crashpad permissions).
- We need a fallback path that always works.

## Primary Path (Playwright)
1. Start the dev server.
2. Run the capture script.
3. Verify output folders and manifest.

### Commands
```bash
npm run dev
# in a new shell
npx playwright test scripts/capture-screenshots.ts --headed
```
### If the port is busy
```bash
CIRCUITMIND_BASE_URL=http://localhost:3002 \
CIRCUITMIND_SKIP_WEB_SERVER=1 \
npx playwright test scripts/capture-screenshots.ts --headed
```

## Fallback Path (Claude DevTools)
- Use Claude’s Chrome DevTools MCP to capture full-page and element shots.
- Follow the audit’s “mandatory sequence” and store results in `docs/screenshots/`.

## Verification Checklist
- [ ] Screenshot folders updated.
- [ ] `docs/screenshots/MANIFEST.md` regenerated.
- [ ] `docs/screenshots/UI_AUDIT_REPORT.md` recapture status updated.

## Known Failure Mode
- Chromium crashpad `setsockopt` permission error.
- Fix: use fallback capture or run on a host with full Chrome permissions.
