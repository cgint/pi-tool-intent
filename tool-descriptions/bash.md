Execute a shell command in the project directory.

- `command` — Shell command to execute.
- `timeout` — (optional) Timeout in milliseconds.
- `intent` — MANDATORY. Concise semantic goal this command serves. Omission will cause tool rejection.
- `rationale` — Optional. One-sentence pointer to the evidence/source that triggered this command (e.g. a failing test, a spec section, a file:line, the user's request). Omit when the trigger is the immediately preceding context.
