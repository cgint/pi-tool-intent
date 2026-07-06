# pi-tool-intent

## Precommit checks (CRUCIAL — must be green before every commit)

```bash
npm run precommit
```

Runs: `tsc --noEmit` → `npm run test` → all must pass.

## Known vulnerabilities (transitive deps)

14 vulnerabilities in `node_modules` (mostly transitive via `@earendil-works/pi-coding-agent`, `@earendil-works/pi-ai`, `vitest`). Not directly fixable without upgrading peer/dev deps. Track via `npm audit`.