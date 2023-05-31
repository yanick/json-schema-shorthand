import { test, expect } from "vitest";

import { object, array, number, integer, string } from "./index.js";

test("number", () => {
  expect(number()).toMatchObject({ type: "number" });

  expect(number({ minimum: 3 })).toMatchObject({ type: "number", minimum: 3 }); //, "arguments");
});

test("string", () => {
  expect(string()).toMatchObject({ type: "string" }); //, "no argument");

  expect(string({ minimum: 3 })).toMatchObject({ type: "string", minimum: 3 }); //, "arguments");
});

test("integer", () => {
  expect(integer()).toMatchObject({ type: "integer" }); //, "no argument");

  expect(integer({ minimum: 3 })).toMatchObject({
    type: "integer",
    minimum: 3,
  }); //, "arguments");
});

test("array", () => {
  expect(array()).toMatchObject({ type: "array" }); //, "no argument");

  expect(array("string")).toMatchObject({
    type: "array",
    items: { type: "string" },
  });
  //"w/ items"
  //);

  expect(array("string", { minItems: 3 })).toMatchObject({
    type: "array",
    items: { type: "string" },
    minItems: 3,
  });
  //"w/ items and options"
  //);
});

test("object", () => {
  expect(object()).toMatchObject({ type: "object" }); //, "no argument");

  expect(object({ foo: "string" })).toMatchObject({
    type: "object",
    properties: { foo: { type: "string" } },
  });
  //"w/ properties"
  //);

  expect(object({ foo: "string" }, { maxProperties: 3 })).toMatchObject({
    type: "object",
    properties: { foo: { type: "string" } },
    maxProperties: 3,
  });
});

test("with description", () => {
  expect(object(null, "foo", { additionalProperties: true })).toMatchObject({
    description: "foo",
    additionalProperties: true,
  });
  //"turn the string into desc"
  //);
});
