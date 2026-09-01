import { describe, expect, it } from "vitest";
import register from "../../index";

describe("extension registration", () => {
  it("registers write/edit/bash/read tools with investigative intent guidance", () => {
    const tools: { name: string; promptGuidelines?: string[] }[] = [];
    const pi = {
      registerTool(tool: { name: string; promptGuidelines?: string[] }) {
        tools.push(tool);
      },
      registerFlag() {},
      registerCommand() {},
    } as any;

    register(pi);

    expect(tools.map((tool) => tool.name).sort()).toEqual(["bash", "edit", "read", "write"]);
    expect(tools.map((tool) => tool.promptGuidelines)).toEqual([
      ["For investigative tool calls, state the claim or uncertainty being tested in intent and the observation that would change the conclusion; include the consequence when useful. Do not invent a result before observing it."],
      ["For investigative tool calls, state the claim or uncertainty being tested in intent and the observation that would change the conclusion; include the consequence when useful. Do not invent a result before observing it."],
      ["For investigative tool calls, state the claim or uncertainty being tested in intent and the observation that would change the conclusion; include the consequence when useful. Do not invent a result before observing it."],
      ["For investigative tool calls, state the claim or uncertainty being tested in intent and the observation that would change the conclusion; include the consequence when useful. Do not invent a result before observing it."],
    ]);
  });
});