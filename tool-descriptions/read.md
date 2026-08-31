Read the contents of a file. Supports text files and images (jpg, png, gif, webp). Images are sent as attachments. For text files, output is truncated to 2000 lines or 50KB (whichever is hit first). Use offset/limit for large files. When you need the full file, continue with offset until complete.

- `path` — file to read (relative or absolute).
- `offset` — (optional) Line number to start reading from (1-indexed).
- `limit` — (optional) Maximum number of lines to read.
- `intent` — MANDATORY. Concise semantic goal of this read. Omission will cause tool rejection.
- `rationale` — Optional. One-sentence pointer to the evidence/source that triggered this read (e.g. a symbol found in another file, a user request, a spec section). Omit when the trigger is the immediately preceding context.
