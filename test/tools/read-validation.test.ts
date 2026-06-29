import { describe, expect, it } from "vitest";
import { Value } from "@sinclair/typebox/value";
import { readToolSchema } from "../../src/read";

describe("readToolSchema", () => {
  it("accepts read call with path, intent, and rationale", () => {
    const result = Value.Check(readToolSchema, {
      path: "foo.ts",
      intent: "checking auth",
      rationale: "need to match pattern",
    });
    expect(result).toBe(true);
  });

  it("accepts read call with offset and limit", () => {
    const result = Value.Check(readToolSchema, {
      path: "foo.ts",
      intent: "checking auth",
      rationale: "need to match pattern",
      offset: 10,
      limit: 20,
    });
    expect(result).toBe(true);
  });

  it("rejects read call without intent", () => {
    const result = Value.Check(readToolSchema, {
      path: "foo.ts",
      rationale: "need to match pattern",
    });
    expect(result).toBe(false);
  });

  it("rejects read call without rationale", () => {
    const result = Value.Check(readToolSchema, {
      path: "foo.ts",
      intent: "checking auth",
    });
    expect(result).toBe(false);
  });

  it("rejects read call without intent and rationale", () => {
    const result = Value.Check(readToolSchema, { path: "foo.ts" });
    expect(result).toBe(false);
  });

  it("rejects read call with empty intent", () => {
    const result = Value.Check(readToolSchema, {
      path: "foo.ts",
      intent: "",
      rationale: "need to match pattern",
    });
    expect(result).toBe(false);
  });

  it("rejects read call with empty rationale", () => {
    const result = Value.Check(readToolSchema, {
      path: "foo.ts",
      intent: "checking auth",
      rationale: "",
    });
    expect(result).toBe(false);
  });

  it("rejects read call with unknown field", () => {
    const result = Value.Check(readToolSchema, {
      path: "foo.ts",
      intent: "checking auth",
      rationale: "need to match pattern",
      unknown: "nope",
    });
    expect(result).toBe(false);
  });
});
