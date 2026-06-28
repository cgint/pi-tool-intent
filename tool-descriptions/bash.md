Execute a shell command in the project directory.

Every bash call must include concise provenance:
```json
{
  "command": "npm test",
  "intent": "Verify that existing functionality is not broken by recent changes.",
  "rationale": "The feature touched test-heavy modules; regression check is necessary before commit."
}
```
- `command` — Shell command to execute.
- `intent` — Required concise statement of the semantic goal this command serves. Do not merely restate the command.
- `rationale` — Required concise justification for this command, focusing on user requirements, evidence, constraints, or assumptions not obvious from the command.
- `timeout` — (optional) Timeout in milliseconds.

Example:
```json
{ "command": "npm test", "intent": "Verify that existing functionality is not broken by recent changes.", "rationale": "The feature touched test-heavy modules; regression check is necessary before commit." }
```

Rules:
- Do not omit intent or rationale; metadata strings must not be empty.
- For non-destructive commands (list files, grep, run tests), always provide intent and rationale.
