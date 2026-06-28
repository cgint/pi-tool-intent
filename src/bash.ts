import { Text } from "@earendil-works/pi-tui";
import type { ExtensionAPI, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { createBashTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { readFileSync } from "fs";

const BASH_DESC = readFileSync(
  new URL("../tool-descriptions/bash.md", import.meta.url),
  "utf-8",
).trim();

const BASH_PROMPT_SNIPPET = readFileSync(
  new URL("../tool-descriptions/bash-snippet.md", import.meta.url),
  "utf-8",
).trim();

export const bashToolSchema = Type.Object(
  {
    command: Type.String({
      description: "Shell command to execute",
    }),
    timeout: Type.Optional(Type.Number({
      description: "Timeout in milliseconds",
    })),
    intent: Type.String({
      minLength: 1,
      description: "Required concise semantic goal this command serves; do not merely restate the literal command.",
    }),
    rationale: Type.String({
      minLength: 1,
      description: "Required concise justification for this command, focusing on user requirements, evidence, constraints, or assumptions not obvious from the command itself.",
    }),
  },
  { additionalProperties: false },
);

type BashRequestParams = {
  command: string;
  timeout?: number;
  intent: string;
  rationale: string;
};

export function assertBashRequest(request: unknown): asserts request is BashRequestParams {
  if (typeof request !== "object" || request === null || Array.isArray(request)) {
    throw new Error("Bash request must be an object.");
  }
  const candidate = request as Record<string, unknown>;
  if (typeof candidate.command !== "string" || candidate.command.length === 0) {
    throw new Error('Bash request requires a non-empty "command" string.');
  }
  if (typeof candidate.intent !== "string" || candidate.intent.length === 0) {
    throw new Error('Bash request requires a non-empty "intent" string.');
  }
  if (typeof candidate.rationale !== "string" || candidate.rationale.length === 0) {
    throw new Error('Bash request requires a non-empty "rationale" string.');
  }
}

function formatBashProvenance(
  args: Partial<BashRequestParams> | undefined,
  theme: { bold: (text: string) => string; fg: (token: string, text: string) => string },
): string | undefined {
  if (!args) return undefined;

  const intent = typeof args.intent === "string" ? args.intent : undefined;
  const rationale = typeof args.rationale === "string" ? args.rationale : undefined;

  if (intent === undefined && rationale === undefined) {
    return undefined;
  }

  const lines = [`${theme.bold("Bash provenance")}`];
  if (intent !== undefined) lines.push(`  Intent: ${intent}`);
  if (rationale !== undefined) lines.push(`  Rationale: ${rationale}`);

  return `${theme.fg("toolOutput", theme.bold("Bash provenance:"))}\n${lines.join("\n")}\n--------------`;
}

function formatBashCall(
  args: Partial<BashRequestParams> | undefined,
  theme: { bold: (text: string) => string; fg: (token: string, text: string) => string },
): string {
  const command = args?.command;
  const cmdDisplay = typeof command === "string" && command.length > 0
    ? theme.fg("toolOutput", command)
    : theme.fg("toolOutput", "...");
  let text = `${theme.fg("toolTitle", theme.bold("bash"))} ${cmdDisplay}`;

  const provenance = formatBashProvenance(args, theme);
  if (provenance) {
    text += `\n\n${provenance}`;
  }

  return text;
}

type BashToolDefinition = ToolDefinition<typeof bashToolSchema> & { renderShell?: "default" | "self" };

const bashToolDefinition: BashToolDefinition = {
  name: "bash",
  label: "Bash",
  description: BASH_DESC,
  parameters: bashToolSchema,
  promptSnippet: BASH_PROMPT_SNIPPET,
  renderShell: "default",

  renderCall(args, theme, context) {
    const text = context.lastComponent instanceof Text
      ? context.lastComponent
      : new Text("", 0, 0);
    text.setText(formatBashCall(args, theme));
    return text;
  },

  async execute(toolCallId, params, signal, onUpdate, ctx) {
    assertBashRequest(params);
    const builtinBash = createBashTool(ctx.cwd);
    return builtinBash.execute(
      toolCallId,
      { command: params.command, timeout: params.timeout },
      signal,
      onUpdate,
    );
  },
};

export function registerBashTool(pi: ExtensionAPI): void {
  pi.registerTool(bashToolDefinition);
}
