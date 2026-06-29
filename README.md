# pi-tool-intent

Pi extension that requires **intent** and **rationale** provenance fields on `write`, `edit`, `bash`, and `read` tool calls.

## Motivation

Built-in `write`, `edit`, and `bash` tools accept structural parameters (path, content, edits, command) but don't require the model to state *why* it's performing the action. This means models can make changes without demonstrating understanding of the goal, leading to:

- **Opaques changes** — the diff shows what changed but not why
- **Speculative edits** — the model guesses at requirements rather than grounding them
- **Audit gaps** — review tools can't surface the reasoning behind tool calls

## How It Works

This extension **shadows** the built-in `write`, `edit`, `bash`, and `read` tools with drop-in replacements that add `intent` and `rationale` fields:

| Field | Description |
|---|---|
| `intent` | Concise semantic goal this action serves |
| `rationale` | Concise justification grounded in user requirements, evidence, constraints, or assumptions |

Example `write` call:
```json
{
  "path": "src/auth.ts",
  "content": "...",
  "intent": "Add token refresh logic required by spec section 3.2.",
  "rationale": "The refresh endpoint is missing; integration tests fail without it."
}
```

Example `edit` call:
```json
{
  "path": "src/main.ts",
  "edits": [
    {
      "oldText": "const x = 1;",
      "newText": "const x = 42;",
      "intent": "Use sentinel value documented in the spec.",
      "rationale": "The contract requires x=42; callers assert this value."
    }
  ]
}
```

Example `bash` call:
```json
{
  "command": "npm test",
  "intent": "Verify no regressions before commit.",
  "rationale": "The feature touched test-heavy modules; regression check required."
}
```

Each edit entry in `edit` calls carries its own `intent`/`rationale`, keeping provenance granular per-change.

## Installation

```bash
npm link  # from this directory
```

Then enable in your pi configuration. The extension registers tools with the exact names `write`, `edit`, `bash`, and `read`, so they automatically shadow the built-ins.

## Read tool

The `read` tool shadows the built-in with mandatory `intent` and `rationale` fields, consistent with `write`, `edit`, and `bash`.

The extended schemas add `intent: string` and `rationale: string` (both `minLength: 1`). If either field is missing or empty, the call is rejected with a validation error.

### write
```
{ path: string, content: string, intent: string, rationale: string }
```

### edit
```
{ path: string, edits: [{ oldText: string, newText: string, intent: string, rationale: string }] }
```

### bash
```
{ command: string, timeout?: number, intent: string, rationale: string }
```

### read
```
{ path: string, offset?: number, limit?: number, intent: string, rationale: string }
```

## Design Notes

- **Tool shadowing**: Registers replacement tools with identical names to shadow built-ins. No changes to LLM prompts needed beyond the tool descriptions.
- **Schema extension**: Uses TypeBox to extend built-in schemas by appending `intent` and `rationale` fields before validation.
- **Delegation**: All execution is delegated to built-in operations (`createWriteTool`, `createEditTool`, `createBashTool`). Intent fields are stripped before delegation.
- **No runtime validation of quality**: Currently checks `minLength: 1`. Quality of intent/rationale is enforced via tool description prompts, not heuristic patterns. Future work could add anti-fluff heuristics.

## License

MIT