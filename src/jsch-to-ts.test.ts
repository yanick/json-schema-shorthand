import { test, expectTypeOf, expect } from "vitest";
import { FromSchema } from "json-schema-to-ts";
import * as R from "remeda";

import shorthand, * as j from "./index.js";

test("'number' string shorthand", () => {
  const res = shorthand("number" as const);

  expect(res).toEqual({ type: "number" });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<number>();
});
test("'integer' string shorthand", () => {
  const res = shorthand("integer" as const);

  expect(res).toEqual({ type: "integer" });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<number>();
});
test("'null' string shorthand", () => {
  const res = shorthand("null" as const);

  expect(res).toEqual({ type: "null" });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<null>();
});
test("'boolean' string shorthand", () => {
  const res = shorthand("boolean" as const);

  expect(res).toEqual({ type: "boolean" });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<boolean>();
});
test("'object' string shorthand", () => {
  const res = shorthand("object" as const);

  expect(res).toEqual({ type: "object" });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<{
    [k: string]: unknown;
  }>();
});
test("'array' string shorthand", () => {
  const res = shorthand("array" as const);

  expect(res).toEqual({ type: "array" });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<unknown[]>();
});

test("object", () => {
  const res = shorthand({
    object: {
      foo: "number",
    },
  } as const);

  expect(R.clone(res)).toEqual({
    type: "object",
    properties: {
      foo: { type: "number" },
    },
  });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<{
    foo?: number;
  }>();
});
test("array", () => {
  const res = shorthand({
    array: "number",
  } as const);

  expect(res).toEqual({
    type: "array",
    items: {
      type: "number",
    },
  });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<number[]>();
});
test("required!", () => {
  const res = shorthand("number!" as const);

  expect(res).toEqual({ type: "number", required: true });

  let s: FromSchema<Omit<typeof res, "required">>;

  expectTypeOf(s).toMatchTypeOf<number>();
});

test("local ref", () => {
  const res = shorthand("#/$defs/foo" as const);

  expect(res).toEqual({ $ref: "#/$defs/foo" });
});
test("general ref", () => {
  const res = shorthand("$foo" as const);

  expect(res).toEqual({ $ref: "foo" });
});
test("required ref", () => {
  const res = shorthand("$foo!" as const);

  expect(res).toEqual({ $ref: "foo", required: true });
});

test("required properties", () => {
  const res = shorthand({
    object: {
      foo: "number!",
      bar: "boolean",
      baz: "#/properties/bar!",
    },
  } as const);

  expect(R.clone(res)).toEqual({
    type: "object",
    properties: {
      foo: { type: "number" },
      bar: { type: "boolean" },
      baz: { $ref: "#/properties/bar" },
    },
    required: ["foo", "baz"],
  });

  expectTypeOf(res).not.toMatchTypeOf<{
    properties: {
      foo: { required: boolean };
    };
  }>();

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<{
    foo: number;
    bar?: boolean;
    baz: boolean;
  }>();
});

test("anyOf", () => {
  const res = shorthand({
    anyOf: [{ object: { foo: "number" } }, { object: { bar: "string" } }],
  } as const);

  const x = res.anyOf[0].properties;

  expect(res).toEqual({
    anyOf: [
      { type: "object", properties: { foo: { type: "number" } } },
      { type: "object", properties: { bar: { type: "string" } } },
    ],
  });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<
    | {
        foo?: number;
      }
    | { bar?: string }
  >();
});
test("allOf", () => {
  const res = shorthand({
    allOf: [{ object: { foo: "number!" } }, { object: { bar: "string!" } }],
  } as const);

  expect(res).toEqual({
    allOf: [
      {
        type: "object",
        required: ["foo"],
        properties: { foo: { type: "number" } },
      },
      {
        type: "object",
        required: ["bar"],
        properties: { bar: { type: "string" } },
      },
    ],
  });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<{
    foo: number;
    bar: string;
  }>();
});

test("oneOf", () => {
  const res = shorthand({
    oneOf: [{ object: { foo: "number!" } }, { object: { bar: "string!" } }],
  } as const);

  expect(res).toEqual({
    oneOf: [
      {
        type: "object",
        properties: { foo: { type: "number" } },
        required: ["foo"],
      },
      {
        type: "object",
        properties: { bar: { type: "string" } },
        required: ["bar"],
      },
    ],
  });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<
    | {
        foo: number;
      }
    | { bar: string }
  >();
});

test("not", () => {
  const res = shorthand({
    not: { object: { foo: "number!" } },
  } as const);

  expect(res).toEqual({
    not: {
      type: "object",
      properties: { foo: { type: "number" } },
      required: ["foo"],
    },
  });

  let s: FromSchema<typeof res>;

  expectTypeOf(s).toMatchTypeOf<unknown>();
});

test("primitives shorthand", () => {
  const res = shorthand({ string: { default: "foo" } } as const);
  expect(res).toMatchObject({ type: "string", default: "foo" });
  expectTypeOf(res).toMatchTypeOf<{ type: "string" }>();
});
