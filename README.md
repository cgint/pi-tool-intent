# pi-tool-intent

## Decision (agreed 2026-08-31, from session study)

Final contract, implemented 2026-08-31:

- **`intent` (mandatory, call-level):** the goal — where the action is heading. Generative: the model must synthesize it, can't copy it from context. This is the pre-action checkpoint.
- **`rationale` (optional, call-level):** a *compressed reasoning artifact* — one sentence pointing at the evidence/source that triggered the action (a failing test, a spec section, a file:line, the user's request). Not a justification essay; a provenance pointer. Include only when the trigger isn't already the immediately preceding context; omit otherwise.
- **No per-edit fields** — provenance lives at the call level; edits with different intents get split into separate calls.

Evidence from the study (~30 sessions, 1,974 rejected calls; worst session 47% of all calls rejected; typical 8–9%):

Study findings behind this decision:

2. **Top-level `intent` missing on `read`** — ~1/3 of `read` rejections drop both fields, consistent with `tool-descriptions/read.md` telling the model they are "optional" while the schema requires them.
3. **Top-level `rationale` dropped** — ~30% of non-edit rejections. Failure mode is *omission*, not garbage: sampled successful rationales from high-attention sessions are genuinely good (concrete, evidence-grounded), so the field has value when present.
4. **Structural confusion** (wrong `path`/`oldText`/`newText` shape, ~14%) — unrelated to provenance; noted, out of scope.

Implemented contract (2026-08-31):

```
bash:  { command, timeout?, intent, rationale? }
write: { path, content, intent, rationale? }
edit:  { path, edits, intent, rationale? }   ← no per-edit fields
read:  { path, offset?, limit?, intent, rationale? }
```

- `intent` stays **mandatory** on all four tools — it is the generative pre-action checkpoint (the model must synthesize a goal it cannot copy from context).
- `rationale` becomes **optional** (`Type.Optional`) — keeps its grounding value in high-attention calls, removes the retry tax when attention degrades; also fixes the read-prose/schemas contradiction by design.
- `edit` keeps only top-level provenance — per-edit fields were the dominant failure class and add little for a live human reader.
- Slim field descriptions to name + MANDATORY/optional + one-line definition; drop stylistic instructions and JSON examples (they degrade first under context pressure).

Expected effect: eliminates roughly 80–90% of observed rejections. Residual risk (occasional `intent` dropout at high context) is not fixable in this extension; smaller surface area only mitigates it.

---

Pi extension that requires a mandatory **intent** field (and accepts an optional **rationale** evidence pointer) on `write`, `edit`, `bash`, and `read` tool calls.

## Motivation

Built-in `write`, `edit`, and `bash` tools accept structural parameters (path, content, edits, command) but don't require the model to state *why* it's performing the action. This means models can make changes without demonstrating understanding of the goal, leading to:

- **Opaques changes** — the diff shows what changed but not why
- **Speculative edits** — the model guesses at requirements rather than grounding them
- **Audit gaps** — review tools can't surface the reasoning behind tool calls

## How It Works

This extension **shadows** the built-in `write`, `edit`, `bash`, and `read` tools with drop-in replacements that add `intent` (mandatory) and `rationale` (optional) fields at the call level:

| Field | Description |
|---|---|
| `intent` | **Mandatory.** Concise semantic goal. For investigation, name the claim/uncertainty being tested and the observation that would change the conclusion. |
| `rationale` | **Optional.** One-sentence pointer to the evidence/source that triggered the action (a failing test, a spec section, a file:line, the user's request). Omit when the trigger is already the immediately preceding context. |

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
    { "oldText": "const x = 1;", "newText": "const x = 42;" }
  ],
  "intent": "Use the sentinel value documented in the spec.",
  "rationale": "Spec section 2.4 pins x to 42; callers assert this value."
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

For investigative tool calls, state the claim or uncertainty being tested in `intent` and the observation that would change the conclusion; include the consequence when useful. Do not invent a result before observing it.

Provenance lives at the **call level** only — `edit` entries carry no per-edit fields (per-edit provenance was the dominant rejection class in observed sessions and added little for live review).

## Installation

```bash
npm link  # from this directory
```

Then enable in your pi configuration. The extension registers tools with the exact names `write`, `edit`, `bash`, and `read`, so they automatically shadow the built-ins.

## Read tool

The `read` tool shadows the built-in with a mandatory `intent` field and optional `rationale`, consistent with `write`, `edit`, and `bash`.

The extended schemas add `intent: string` (mandatory, `minLength: 1`) and `rationale?: string` (optional; must be non-empty when provided). A missing/empty `intent` rejects the call; `rationale` is only validated when present.

### write
```
{ path: string, content: string, intent: string, rationale?: string }
```

### edit
```
{ path: string, edits: [{ oldText: string, newText: string }], intent: string, rationale?: string }
```

### bash
```
{ command: string, timeout?: number, intent: string, rationale?: string }
```

### read
```
{ path: string, offset?: number, limit?: number, intent: string, rationale?: string }
```

## Design Notes

- **Tool shadowing**: Registers replacement tools with identical names to shadow built-ins. No changes to LLM prompts needed beyond the tool descriptions.
- **Schema extension**: Uses TypeBox to extend built-in schemas with a mandatory `intent` and an optional `rationale` at the call level.
- **Delegation**: All execution is delegated to built-in operations (`createWriteTool`, `createEditTool`, `createBashTool`, `createReadToolDefinition`). Provenance fields are stripped before delegation.
- **No runtime validation of quality**: Checks presence and `minLength: 1`. Quality of intent/rationale is enforced via tool description prompts, not heuristic patterns. Future work could add anti-fluff heuristics.
- **Why rationale is optional (2026-08-31)**: A session study of ~30 sessions (1,974 rejected calls) showed per-edit provenance was ~58% of all rejections and the read prose/schema contradiction drove ~1/3 of read rejections. Rationale is a *retrieval* field (it points at evidence already in context), so under attention pressure the model drops it rather than writing garbage — the study found dropped-but-good rationales, not garbage ones. Keeping it optional preserves its provenance-pointer value without the retry tax; `intent` stays mandatory because it is the generative pre-action checkpoint.

## License

MIT