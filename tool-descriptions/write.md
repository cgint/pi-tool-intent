Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Automatically creates parent directories.

Every call MUST include both `intent` and `rationale` fields. Missing either field causes tool rejection.

```json
{
  "path": "src/main.ts",
  "content": "export const value = 42;\n",
  "intent": "What is this write trying to achieve? (1 sentence, not just 'creating a file')",
  "rationale": "Why is it needed? (user req, evidence, constraint — 1 sentence)"
}
```

- `path` — file to create or overwrite.
- `content` — complete file content to write.
- `intent` — MANDATORY. 1-sentence semantic goal. Omission = rejection.
- `rationale` — MANDATORY. 1-sentence justification. Omission = rejection.
