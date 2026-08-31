Edit a single file using exact text replacement. Every edits[].oldText must match a unique, non-overlapping region of the original file.

- `path` — file to edit.
- `edits` — array of `{ oldText, newText }` replacement blocks.
- `intent` — MANDATORY. Concise semantic goal this edit call serves. Omission will cause tool rejection.
- `rationale` — Optional. One-sentence pointer to the evidence/source that triggered this edit (e.g. a user request, a spec section, a failing test). Omit when the trigger is the immediately preceding context.

Rules:
- Do not include neighboring context lines in oldText/newText unless necessary for uniqueness.
- Do not emit overlapping or adjacent edits — merge them into one, or split into separate edit calls.
