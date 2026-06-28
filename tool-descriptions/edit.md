Edit a single file using exact text replacement. Every edits[].oldText must match a unique, non-overlapping region of the original file.

Each edit entry MUST include both `intent` and `rationale`. Missing either field causes tool rejection.

```json
{
  "path": "src/main.ts",
  "edits": [
    {
      "oldText": "const x = 1;",
      "newText": "const x = 42;",
      "intent": "What does this edit achieve? (1 sentence, not a restatement)",
      "rationale": "Why is this justified? (evidence, constraint — 1 sentence)"
    }
  ]
}
```

- `edits[].oldText` — Exact text to find and replace. Must be unique in the file.
- `edits[].newText` — Replacement text.
- `edits[].intent` — MANDATORY. 1-sentence semantic goal. Omission = rejection.
- `edits[].rationale` — MANDATORY. 1-sentence justification. Omission = rejection.

Rules:
- Do not include neighboring context lines in oldText/newText unless necessary for uniqueness.
- Do not emit overlapping or adjacent edits — merge them into one, or split into separate edit calls.