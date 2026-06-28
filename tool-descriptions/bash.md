Execute a shell command in the project directory.

Every call MUST include both `intent` and `rationale` fields. Missing either field causes tool rejection.

```json
{
  "command": "npm test",
  "intent": "One sentence: what is this command trying to achieve? (not a restatement of the command)",
  "rationale": "One sentence: why is it needed? (user req, evidence, constraint)"
}
```

- `command` — Shell command to execute.
- `intent` — MANDATORY. 1-sentence semantic goal. Omission = rejection.
- `rationale` — MANDATORY. 1-sentence justification. Omission = rejection.
- `timeout` — (optional) Timeout in milliseconds.

Example:
```json
{ "command": "npm test", "intent": "Verify no regressions before commit.", "rationale": "The feature touched test-heavy modules." }
```