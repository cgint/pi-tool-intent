Edit a single file using exact text replacement. Every edits[].oldText must match a unique, non-overlapping region of the original file.

Each edit entry replaces one target text block and must include concise provenance:
```json
{
  "oldText": "Exact text to replace",
  "newText": "Replacement text",
  "intent": "Semantic goal this edit serves.",
  "rationale": "Why this edit is justified."
}
```
- `oldText` — Exact text to find and replace. Must match a unique region in the file.
- `newText` — Replacement text.
- `intent` — Required concise statement of the semantic goal this edit serves. Do not merely restate the literal line change.
- `rationale` — Required concise justification for this edit, focusing on user requirements, evidence, constraints, or assumptions not obvious from the diff.

Example:
```json
{ "path": "src/main.ts", "edits": [
  {
    "oldText": "const x = 1;",
    "newText": "const x = 42;",
    "intent": "Use the sentinel value documented in the spec.",
    "rationale": "The contract requires x=42; callers assert this value."
  }
] }
```

Rules:
- Do not include neighboring context lines in oldText/newText unless necessary for uniqueness.
- Do not emit overlapping or adjacent edits — merge them into one, or split into separate edit calls.
- Do not omit intent or rationale; metadata strings must not be empty.
