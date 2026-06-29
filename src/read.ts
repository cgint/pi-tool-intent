import { Text } from "@earendil-works/pi-tui";
import type { ExtensionAPI, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { createReadToolDefinition } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { readFileSync } from "fs";

const READ_DESC = readFileSync(
  new URL("../tool-descriptions/read.md", import.meta.url),
  "utf-8",
).trim();

const READ_PROMPT_SNIPPET = readFileSync(
  new URL("../tool-descriptions/read-snippet.md", import.meta.url),
  "utf-8",
).trim();

function makeReadSchema() {
  return Type.Object(
    {
      path: Type.String({
        description: "Path to the file to read (relative or absolute)",
      }),
      offset: Type.Optional(Type.Number({
        description: "Line number to start reading from (1-indexed)",
      })),
      limit: Type.Optional(Type.Number({
        description: "Maximum number of lines to read",
      })),
      intent: Type.Optional(Type.String({
        description: "Optional concise semantic goal this read serves. Include when investigating.",
      })),
      rationale: Type.Optional(Type.String({
        description: "Optional concise justification for this read. Include when investigating.",
      })),
    },
    { additionalProperties: false },
  );
}

export const readToolSchema = makeReadSchema();

type ReadRequestParams = {
  path: string;
  offset?: number;
  limit?: number;
  intent?: string;
  rationale?: string;
};

/**
 * Runtime state: when true, calls without intent/rationale are rejected.
 * Toggled via /pi-tool-intent-read on|off.
 */
let readIntentEnabled = false;

export function setReadIntentEnabled(value: boolean): void {
  readIntentEnabled = value;
}

export function getReadIntentEnabled(): boolean {
  return readIntentEnabled;
}

function assertReadIntent(args: Partial<ReadRequestParams>): void {
  if (!readIntentEnabled) return;
  if (typeof args.intent !== "string" || args.intent.length === 0) {
    throw new Error('read call requires "intent" when read-intent mode is enabled.');
  }
  if (typeof args.rationale !== "string" || args.rationale.length === 0) {
    throw new Error('read call requires "rationale" when read-intent mode is enabled.');
  }
}

function formatReadProvenance(
  args: Partial<ReadRequestParams> | undefined,
  theme: { bold: (text: string) => string; fg: (token: string, text: string) => string },
): string | undefined {
  if (!args) return undefined;

  const intent = typeof args.intent === "string" ? args.intent : undefined;
  const rationale = typeof args.rationale === "string" ? args.rationale : undefined;

  if (intent === undefined && rationale === undefined) {
    return undefined;
  }

  const lines: string[] = [];
  if (intent !== undefined) lines.push(`  Intent: ${intent}`);
  if (rationale !== undefined) lines.push(`  Rationale: ${rationale}`);

  return `${theme.fg("toolOutput", theme.bold("Read provenance:"))}\n${lines.join("\n")}\n--------------`;
}

function formatReadCall(
  args: Partial<ReadRequestParams> | undefined,
  theme: { bold: (text: string) => string; fg: (token: string, text: string) => string },
): string {
  const path = args?.path;
  const pathDisplay =
    typeof path === "string" && path.length > 0
      ? theme.fg("accent", path)
      : theme.fg("toolOutput", "...");

  let text = `${theme.fg("toolTitle", theme.bold("read"))} ${pathDisplay}`;

  const provenance = formatReadProvenance(args, theme);
  if (provenance) {
    text += `\n\n${provenance}`;
  }

  return text;
}

export function createReadToolDefinitionWithIntent(cwd: string): ToolDefinition<typeof readToolSchema> {
  const builtin = createReadToolDefinition(cwd);

  return {
    name: "read",
    label: "Read",
    description: READ_DESC,
    parameters: readToolSchema,
    promptSnippet: READ_PROMPT_SNIPPET,
    renderShell: "default" as const,

    renderCall(args, theme, context) {
      const text = context.lastComponent instanceof Text
        ? context.lastComponent
        : new Text("", 0, 0);
      text.setText(formatReadCall(args, theme));
      return text;
    },

    async execute(toolCallId, params, signal, onUpdate, ctx) {
      assertReadIntent(params);
      // Strip intent/rationale before delegating to the built-in read tool.
      const { intent: _intent, rationale: _rationale, ...baseParams } = params;
      return builtin.execute(
        toolCallId,
        baseParams as Parameters<typeof builtin.execute>[1],
        signal,
        onUpdate,
        ctx,
      );
    },
  };
}

export function registerReadTool(pi: ExtensionAPI, cwd: string): void {
  pi.registerTool(createReadToolDefinitionWithIntent(cwd));
}
