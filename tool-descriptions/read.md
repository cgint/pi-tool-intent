Read the contents of a file. Supports text files and images (jpg, png, gif, webp). Images are sent as attachments. For text files, output is truncated to 2000 lines or 50KB (whichever is hit first). Use offset/limit for large files. When you need the full file, continue with offset until complete.

Intent and rationale are **optional** — include them when you want to expose your investigative reasoning. Their presence signals deliberate search strategy; their absence is a normal read.

```json
{
  "path": "src/main.ts",
  "intent": "Checking how auth middleware is structured before adding a new endpoint.",
  "rationale": "The new endpoint requires the same auth pattern used in routes/api.ts."
}
```

- `path` — file to read (relative or absolute).
- `offset` — (optional) Line number to start from (1-indexed).
- `limit` — (optional) Maximum number of lines to read.
- `intent` — (optional) Semantic goal of this read. Include when investigating.
- `rationale` — (optional) Why this file is relevant. Include when investigating.
