import { describe, expect, it } from "vitest";
import { Value } from "@sinclair/typebox/value";
import { assertBashRequest, bashToolSchema } from "../../src/bash";
import { assertEditRequest, editToolSchema } from "../../src/edit";
import { assertWriteRequest, writeToolSchema } from "../../src/write";

describe("assertWriteRequest", () => {
  it("passes for valid write request", () => {
    expect(() => assertWriteRequest({ path: "foo.ts", content: "bar", intent: "create config" })).not.toThrow();
  });

  it("rejects missing intent", () => {
    expect(() => assertWriteRequest({ path: "foo.ts", content: "bar" })).toThrow();
  });

  it("rejects empty intent", () => {
    expect(() => assertWriteRequest({ path: "foo.ts", content: "bar", intent: "" })).toThrow();
  });

  it("rejects non-object input", () => {
    expect(() => assertWriteRequest(null)).toThrow();
    expect(() => assertWriteRequest("string")).toThrow();
  });

  it("rejects empty path", () => {
    expect(() => assertWriteRequest({ path: "", content: "bar" })).toThrow();
  });
});

describe("writeToolSchema", () => {
  it("accepts write with intent only (rationale optional)", () => {
    const result = Value.Check(writeToolSchema, {
      path: "foo.ts",
      content: "bar",
      intent: "create the config",
    });
    expect(result).toBe(true);
  });

  it("accepts write with intent and rationale", () => {
    const result = Value.Check(writeToolSchema, {
      path: "foo.ts",
      content: "bar",
      intent: "create the config",
      rationale: "spec section 2 requires it",
    });
    expect(result).toBe(true);
  });

  it("rejects write without intent", () => {
    const result = Value.Check(writeToolSchema, { path: "foo.ts", content: "bar" });
    expect(result).toBe(false);
  });

  it("rejects write with empty intent", () => {
    const result = Value.Check(writeToolSchema, { path: "foo.ts", content: "bar", intent: "" });
    expect(result).toBe(false);
  });
});

describe("bashToolSchema", () => {
  it("accepts bash with intent only (rationale optional)", () => {
    const result = Value.Check(bashToolSchema, { command: "ls", intent: "list files" });
    expect(result).toBe(true);
  });

  it("accepts bash with intent and rationale", () => {
    const result = Value.Check(bashToolSchema, {
      command: "ls",
      intent: "list files",
      rationale: "layout unknown",
    });
    expect(result).toBe(true);
  });

  it("rejects bash without intent", () => {
    const result = Value.Check(bashToolSchema, { command: "ls" });
    expect(result).toBe(false);
  });
});

describe("assertBashRequest", () => {
  it("passes for valid bash request with intent only", () => {
    expect(() => assertBashRequest({ command: "ls", intent: "list" })).not.toThrow();
  });

  it("rejects empty command", () => {
    expect(() => assertBashRequest({ command: "", intent: "list" })).toThrow();
  });

  it("rejects empty intent", () => {
    expect(() => assertBashRequest({ command: "ls", intent: "" })).toThrow();
  });

  it("rejects present-but-empty rationale", () => {
    expect(() => assertBashRequest({ command: "ls", intent: "list", rationale: "" })).toThrow();
  });
});

describe("editToolSchema", () => {
  const validEdits = [{ oldText: "a", newText: "b" }];

  it("accepts edit call with top-level intent only (rationale optional)", () => {
    const result = Value.Check(editToolSchema, { path: "foo.ts", edits: validEdits, intent: "change value" });
    expect(result).toBe(true);
  });

  it("accepts edit call with top-level intent and rationale", () => {
    const result = Value.Check(editToolSchema, {
      path: "foo.ts",
      edits: validEdits,
      intent: "change value",
      rationale: "spec says 42",
    });
    expect(result).toBe(true);
  });

  it("rejects edit call without top-level intent", () => {
    const result = Value.Check(editToolSchema, { path: "foo.ts", edits: validEdits });
    expect(result).toBe(false);
  });

  it("rejects edit call with per-edit intent field", () => {
    const result = Value.Check(editToolSchema, {
      path: "foo.ts",
      edits: [{ oldText: "a", newText: "b", intent: "per-edit" }],
      intent: "change value",
    });
    expect(result).toBe(false);
  });

  it("rejects edit call with unknown top-level field", () => {
    const result = Value.Check(editToolSchema, {
      path: "foo.ts",
      edits: validEdits,
      intent: "change value",
      unknown: "nope",
    });
    expect(result).toBe(false);
  });
});

describe("assertEditRequest", () => {
  it("passes for valid edit request with top-level intent", () => {
    expect(() =>
      assertEditRequest({
        path: "foo.ts",
        edits: [{ oldText: "a", newText: "b" }],
        intent: "change value",
      }),
    ).not.toThrow();
  });

  it("rejects empty edits array", () => {
    expect(() => assertEditRequest({ path: "foo.ts", edits: [], intent: "x" })).toThrow();
  });

  it("rejects edit with missing top-level intent", () => {
    expect(() =>
      assertEditRequest({ path: "foo.ts", edits: [{ oldText: "a", newText: "b" }] }),
    ).toThrow();
  });

  it("rejects edit with empty top-level intent", () => {
    expect(() =>
      assertEditRequest({ path: "foo.ts", edits: [{ oldText: "a", newText: "b" }], intent: "" }),
    ).toThrow();
  });
});
