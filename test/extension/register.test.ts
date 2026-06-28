import { describe, expect, it } from "vitest";
import register from "../../index";

describe("extension registration", () => {
  it("registers write/edit/bash tools by default", () => {
    const toolNames: string[] = [];
    const pi = {
      registerTool(tool: { name: string }) {
        toolNames.push(tool.name);
      },
    } as any;

    register(pi);

    expect(toolNames.sort()).toEqual(["bash", "edit", "write"]);
  });
});