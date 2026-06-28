import { describe, expect, it } from "vitest";
import { assertBashRequest } from "../../src/bash";
import { assertEditRequest } from "../../src/edit";
import { assertWriteRequest } from "../../src/write";

describe("assertWriteRequest", () => {
  it("passes for valid write request", () => {
    expect(() => assertWriteRequest({ path: "foo.ts", content: "bar" })).not.toThrow();
  });

  it("rejects non-object input", () => {
    expect(() => assertWriteRequest(null)).toThrow();
    expect(() => assertWriteRequest("string")).toThrow();
  });

  it("rejects empty path", () => {
    expect(() => assertWriteRequest({ path: "", content: "bar" })).toThrow();
  });
});

describe("assertEditRequest", () => {
  it("passes for valid edit request", () => {
    expect(() =>
      assertEditRequest({
        path: "foo.ts",
        edits: [{ oldText: "a", newText: "b", intent: "change", rationale: "because" }],
      }),
    ).not.toThrow();
  });

  it("rejects empty edits array", () => {
    expect(() => assertEditRequest({ path: "foo.ts", edits: [] })).toThrow();
  });

  it("rejects edit with empty intent", () => {
    expect(() =>
      assertEditRequest({
        path: "foo.ts",
        edits: [{ oldText: "a", newText: "b", intent: "", rationale: "because" }],
      }),
    ).toThrow();
  });

  it("rejects edit with missing rationale", () => {
    expect(() =>
      assertEditRequest({
        path: "foo.ts",
        edits: [{ oldText: "a", newText: "b", intent: "change" }],
      }),
    ).toThrow();
  });
});

describe("assertBashRequest", () => {
  it("passes for valid bash request", () => {
    expect(() => assertBashRequest({ command: "ls", intent: "list", rationale: "need to see files" })).not.toThrow();
  });

  it("rejects empty command", () => {
    expect(() => assertBashRequest({ command: "", intent: "list", rationale: "need" })).toThrow();
  });

  it("rejects empty intent", () => {
    expect(() => assertBashRequest({ command: "ls", intent: "", rationale: "need" })).toThrow();
  });

  it("rejects missing rationale", () => {
    expect(() => assertBashRequest({ command: "ls", intent: "list" })).toThrow();
  });
});