Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Automatically creates parent directories.

Writes must include concise provenance metadata:
```json
{
  "path": "src/main.ts",
  "content": "export const value = 42;\n",
  "intent": "Create the module required by the requested feature.",
  "rationale": "This file does not exist yet, and the feature needs this exported value."
}
```

Fields:
- `path` — file to create or overwrite.
- `content` — complete file content to write.
- `intent` — required concise statement of the semantic goal this write serves. Do not merely restate that the file is being written.
- `rationale` — required concise justification for this write, focusing on user requirements, evidence, constraints, or assumptions not obvious from the content.
