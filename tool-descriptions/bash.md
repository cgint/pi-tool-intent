Execute a shell command in the project directory.

- `command` — Shell command to execute.
- `timeout` — (optional) Timeout in milliseconds.
- `intent` — MANDATORY. Concise semantic goal. For investigation, name the claim/uncertainty being tested and the observation that would change the conclusion. Omission causes rejection.
- `rationale` — Optional. One-sentence pointer to the evidence/source that triggered this command (e.g. a failing test, a spec section, a file:line, the user's request). Omit when the trigger is the immediately preceding context.
