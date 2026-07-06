# pi-tool-intent

## Precommit checks (CRUCIAL — must be green before every commit)

```bash
npm run precommit
```

Runs: `tsc --noEmit` → `npm run test` → `npm audit --audit-level=moderate` → all must pass.

## Regular maintenance

### Dependency refresh (run monthly or before releases)

```bash
bash ~/.local/bin/node_update_reinstall.sh
npm run precommit
```

Resets `node_modules` + lockfile, upgrades to latest semver-compatible versions, and runs audit. Keeps transitive vulnerabilities from accumulating.

### Current vulnerability status

Last checked: 2026-07-06 — **0 vulnerabilities** (after upgrading `@earendil-works/pi-coding-agent` from `^0.74.0` to `^0.80.3`).

Monitor for new advisories via `npm audit` or weekly cron if desired.