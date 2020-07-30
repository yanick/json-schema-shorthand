import tap from "tap";

import { object, array, number, integer, string } from "./index";

tap.test("number", async t => {
  t.same(number(), { type: "number" }, "no argument");

  t.same(number({ minimum: 3 }), { type: "number", minimum: 3 }, "arguments");

  t.same(
    number({ range: [3, 5] }),
    { type: "number", minimum: 3, maximum: 5 },
    "shorthand arguments"
  );
});

tap.test("string", async t => {
  t.same(string(), { type: "string" }, "no argument");

  t.same(string({ minimum: 3 }), { type: "string", minimum: 3 }, "arguments");

  t.same(
    string({ range: [3, 5] }),
    { type: "string", minimum: 3, maximum: 5 },
    "shorthand arguments"
  );
});

tap.test("integer", async t => {
  t.same(integer(), { type: "integer" }, "no argument");

  t.same(integer({ minimum: 3 }), { type: "integer", minimum: 3 }, "arguments");

  t.same(
    integer({ range: [3, 5] }),
    { type: "integer", minimum: 3, maximum: 5 },
    "shorthand arguments"
  );
});

tap.test("array", async t => {
  t.same(array(), { type: "array" }, "no argument");

  t.same(
    array("string"),
    { type: "array", items: { type: "string" } },
    "w/ items"
  );

  t.same(
    array("string", { minItems: 3 }),
    { type: "array", items: { type: "string" }, minItems: 3 },
    "w/ items and options"
  );
});

tap.test("object", async t => {
  t.same(object(), { type: "object" }, "no argument");

  t.same(
    object({ foo: "string" }),
    { type: "object", properties: { foo: { type: "string" } } },
    "w/ properties"
  );

  t.same(
    object({ foo: "string" }, { maxProperties: 3 }),
    {
      type: "object",
      properties: { foo: { type: "string" } },
      maxProperties: 3
    },
    "w/ props and options"
  );
});

tap.test("with description", async t => {
  t.match(
    object(null, "foo", { additionalProperties: true }),
    { description: "foo", additionalProperties: true },
    "turn the string into desc"
  );
});
