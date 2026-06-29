import { describe, expect, it, afterEach } from "vitest";
import { Value } from "@sinclair/typebox/value";
import { readToolSchema, setReadIntentEnabled, getReadIntentEnabled } from "../../src/read";

describe("readToolSchema", () => {
  it("accepts read call without intent/rationale", () => {
    const result = Value.Check(readToolSchema, { path: "foo.ts" });
    expect(result).toBe(true);
  });

  it("accepts read call with intent only", () => {
    const result = Value.Check(readToolSchema, { path: "foo.ts", intent: "checking auth" });
    expect(result).toBe(true);
  });

  it("accepts read call with both intent and rationale", () => {
    const result = Value.Check(readToolSchema, {
      path: "foo.ts",
      intent: "checking auth",
      rationale: "need to match pattern",
    });
    expect(result).toBe(true);
  });

  it("accepts read call with offset and limit", () => {
    const result = Value.Check(readToolSchema, { path: "foo.ts", offset: 10, limit: 20 });
    expect(result).toBe(true);
  });

  it("rejects read call with unknown field", () => {
    const result = Value.Check(readToolSchema, { path: "foo.ts", unknown: "nope" });
    expect(result).toBe(false);
  });
});

describe("read-intent runtime toggle", () => {
  afterEach(() => {
    // Reset to off after each test
    setReadIntentEnabled(false);
  });

  it("defaults to disabled", () => {
    expect(getReadIntentEnabled()).toBe(false);
  });

  it("enables when setReadIntentEnabled(true)", () => {
    setReadIntentEnabled(true);
    expect(getReadIntentEnabled()).toBe(true);
  });

  it("disables when setReadIntentEnabled(false)", () => {
    setReadIntentEnabled(true);
    setReadIntentEnabled(false);
    expect(getReadIntentEnabled()).toBe(false);
  });
});
