import { Text } from "@earendil-works/pi-tui";
import type { ExtensionAPI, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { createEditTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { readFileSync } from "fs";

const EDIT_DESC = readFileSync(
  new URL("../tool-descriptions/edit.md", import.meta.url),
  "utf-8",
).trim();

const EDIT_PROMPT_SNIPPET = readFileSync(
  new URL("../tool-descriptions/edit-snippet.md", import.meta.url),
  "utf-8",
).trim();

function makeEditEntrySchema() {
  return Type.Object(
    {
      oldText: Type.String({
        description: "Exact text for one targeted replacement. It must be unique in the original file.",
      }),
      newText: Type.String({ description: "Replacement text for this targeted edit." }),
      intent: Type.String({
        minLength: 1,
        description: "MANDATORY. Concise semantic goal this edit serves. Omission will cause tool rejection.",
      }),
      rationale: Type.String({
        minLength: 1,
        description: "MANDATORY. Concise justification for this edit. Omission will cause tool rejection.",
      }),
    },
    { additionalProperties: false },
  );
}

export const editToolSchema = Type.Object(
  {
    path: Type.String({
      description: "Path to the file to edit (relative or absolute)",
    }),
    edits: Type.Array(makeEditEntrySchema(), {
      minItems: 1,
      description:
        "One or more targeted replacements. Each edit is matched against the original file. Do not include overlapping or nested edits.",
    }),
    intent: Type.Optional(Type.String({
      description: "Optional concise semantic goal this edit call serves.",
    })),
    rationale: Type.Optional(Type.String({
      description: "Optional concise justification for this edit call.",
    })),
  },
  { additionalProperties: false },
);

type EditEntry = {
  oldText: string;
  newText: string;
  intent: string;
  rationale: string;
};

type EditRequestParams = {
  path: string;
  edits: EditEntry[];
};

export function assertEditRequest(request: unknown): asserts request is EditRequestParams {
  if (typeof request !== "object" || request === null || Array.isArray(request)) {
    throw new Error("Edit request must be an object.");
  }
  const candidate = request as Record<string, unknown>;
  if (typeof candidate.path !== "string" || candidate.path.length === 0) {
    throw new Error('Edit request requires a non-empty "path" string.');
  }
  if (!Array.isArray(candidate.edits) || candidate.edits.length === 0) {
    throw new Error('Edit request requires a non-empty "edits" array.');
  }
  for (let i = 0; i < candidate.edits.length; i++) {
    const edit = candidate.edits[i];
    if (typeof edit !== "object" || edit === null) {
      throw new Error(`Edit ${i} must be an object.`);
    }
    const e = edit as Record<string, unknown>;
    if (typeof e.oldText !== "string" || e.oldText.length === 0) {
      throw new Error(`Edit ${i} requires a non-empty "oldText" string.`);
    }
    if (typeof e.newText !== "string") {
      throw new Error(`Edit ${i} requires a "newText" string.`);
    }
    if (typeof e.intent !== "string" || e.intent.length === 0) {
      throw new Error(`Edit ${i} requires a non-empty "intent" string.`);
    }
    if (typeof e.rationale !== "string" || e.rationale.length === 0) {
      throw new Error(`Edit ${i} requires a non-empty "rationale" string.`);
    }
  }
}

function formatEditProvenance(
  edits: EditEntry[] | undefined,
  theme: { bold: (text: string) => string; fg: (token: string, text: string) => string },
): string | undefined {
  if (!Array.isArray(edits) || edits.length === 0) return undefined;

  const blocks = edits.map((edit, index) => {
    const lines = [`${theme.bold(`Edit ${index + 1}`)}`];
    if (edit.intent) lines.push(`  Intent: ${edit.intent}`);
    if (edit.rationale) lines.push(`  Rationale: ${edit.rationale}`);
    return lines.join("\n");
  });

  return `${theme.fg("toolOutput", theme.bold("Edit provenance:"))}\n${blocks.join("\n")}\n--------------`;
}

function formatEditCall(
  args: Partial<EditRequestParams> | undefined,
  theme: { bold: (text: string) => string; fg: (token: string, text: string) => string },
): string {
  const path = args?.path;
  const pathDisplay =
    typeof path === "string" && path.length > 0
      ? theme.fg("accent", path)
      : theme.fg("toolOutput", "...");
  let text = `${theme.fg("toolTitle", theme.bold("edit"))} ${pathDisplay}`;

  const provenance = formatEditProvenance(args?.edits as EditEntry[] | undefined, theme);
  if (provenance) {
    text += `\n\n${provenance}`;
  }

  return text;
}

type EditToolDefinition = ToolDefinition<typeof editToolSchema> & { renderShell?: "default" | "self" };

const editToolDefinition: EditToolDefinition = {
  name: "edit",
  label: "Edit",
  description: EDIT_DESC,
  parameters: editToolSchema,
  promptSnippet: EDIT_PROMPT_SNIPPET,
  renderShell: "default",

  renderCall(args, theme, context) {
    const text = context.lastComponent instanceof Text
      ? context.lastComponent
      : new Text("", 0, 0);
    text.setText(formatEditCall(args, theme));
    return text;
  },

  async execute(toolCallId, params, signal, onUpdate, ctx) {
    assertEditRequest(params);
    const builtinEdit = createEditTool(ctx.cwd);
    // Strip top-level intent/rationale (optional) and per-edit intent/rationale
    const baseEdits = params.edits.map((e) => ({ oldText: e.oldText, newText: e.newText }));
    return builtinEdit.execute(
      toolCallId,
      { path: params.path, edits: baseEdits },
      signal,
      onUpdate,
    );
  },
};

export function registerEditTool(pi: ExtensionAPI): void {
  pi.registerTool(editToolDefinition);
}
