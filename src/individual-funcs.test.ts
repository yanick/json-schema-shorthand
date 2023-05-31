import { test, expectTypeOf, expect } from "vitest";
import { FromSchema } from "json-schema-to-ts";

import * as j from "./index.js";

test("number", () => {
  const res = j.number();
  expect(res).toEqual({ type: "number" });

  const r2 = j.number("desc");
  expect(r2).toEqual({ type: "number", description: "desc" });

  const r3 = j.number("desc", { maximum: 8 });
  expect(r3).toEqual({ type: "number", description: "desc", maximum: 8 });

  let s: FromSchema<typeof r3>;
  expectTypeOf(s).toMatchTypeOf<number>();
});

test("integer", () => {
  const res = j.integer();
  expect(res).toEqual({ type: "integer" });

  const r2 = j.integer("desc");
  expect(r2).toEqual({ type: "integer", description: "desc" });

  const r3 = j.integer("desc", { maximum: 8 });
  expect(r3).toEqual({ type: "integer", description: "desc", maximum: 8 });

  let s: FromSchema<typeof r3>;
  expectTypeOf(s).toMatchTypeOf<number>();
});

test("string", () => {
  const res = j.string();
  expect(res).toEqual({ type: "string" });

  const r2 = j.string("desc");
  expect(r2).toEqual({ type: "string", description: "desc" });

  const r3 = j.string("desc", { maximum: 8 });
  expect(r3).toEqual({ type: "string", description: "desc", maximum: 8 });

  let s: FromSchema<typeof r3>;
  expectTypeOf(s).toMatchTypeOf<string>();
});

test("boolean", () => {
  const res = j.boolean();
  expect(res).toEqual({ type: "boolean" });

  const r2 = j.boolean("desc");
  expect(r2).toEqual({ type: "boolean", description: "desc" });

  const r3 = j.boolean("desc", { maximum: 8 });
  expect(r3).toEqual({ type: "boolean", description: "desc", maximum: 8 });

  let s: FromSchema<typeof r3>;
  expectTypeOf(s).toMatchTypeOf<boolean>();
});

test("null", () => {
  const res = j.null();
  expect(res).toEqual({ type: "null" });

  const r2 = j.null("desc");
  expect(r2).toEqual({ type: "null", description: "desc" });

  const r3 = j.null("desc", { maximum: 8 });
  expect(r3).toEqual({ type: "null", description: "desc", maximum: 8 });

  const r4 = j.null({ maximum: 8 });
  expect(r4).toEqual({ type: "null", maximum: 8 });

  let s: FromSchema<typeof r4>;
  expectTypeOf(s).toMatchTypeOf<null>();
});

test("object", () => {
  const res = j.object();
  expect(res).toEqual({ type: "object" });

  const r2 = j.object("desc");
  expect(r2).toEqual({ type: "object", description: "desc" });

  const r3 = j.object("desc", { foo: "number" } as const);
  expect(r3).toEqual({
    type: "object",
    description: "desc",
    properties: { foo: { type: "number" } },
  });

  const r4 = j.object(
    { foo: "number" } as const,
    { additionalProperties: false } as const
  );
  expect(r4).toEqual({
    type: "object",
    additionalProperties: false,
    properties: { foo: { type: "number" } },
  });

  let s: FromSchema<typeof r4>;
  expectTypeOf(s).toMatchTypeOf<{
    foo?: number;
  }>();
});

test("array", () => {
  const res = j.array();
  expect(res).toEqual({ type: "array" });

  const r3 = j.array("number" as const);
  expect(r3).toEqual({ type: "array", items: { type: "number" } });

  let s: FromSchema<typeof r3>;
  expectTypeOf(s).toMatchTypeOf<number[]>();
});

test("anyOf", () => {
  const res = j.anyOf(["number", "string"] as const);
  expect(res).toEqual({ anyOf: [{ type: "number" }, { type: "string" }] });

  let s: FromSchema<typeof res>;
  expectTypeOf(s).toMatchTypeOf<number | string>();
});
test("not", () => {
  const res = j.not("number");
  expect(res).toEqual({ not: { type: "number" } });
});
