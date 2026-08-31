Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Automatically creates parent directories.

- `path` — file to create or overwrite.
- `content` — complete file content to write.
- `intent` — MANDATORY. Concise semantic goal this write serves. Omission will cause tool rejection.
- `rationale` — Optional. One-sentence pointer to the evidence/source that triggered this write (e.g. a user request, a spec section, a failing test). Omit when the trigger is the immediately preceding context.
