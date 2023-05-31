import { test, expect } from "vitest";
import * as R from "remeda";

import shorthand from "./index.js";

function shorthandOk(received, expected, _title?: string) {
  expect(R.clone(shorthand(received))).toMatchObject(expected);
}

test("passing undefined", () => shorthandOk(undefined, {}));

test("type as string", () => shorthandOk("string", { type: "string" }));

test("object properties", () => {
  shorthandOk(
    { object: { foo: "string" } },
    { type: "object", properties: { foo: { type: "string" } } }
  );
});

test("expands objects", () => {
  shorthandOk(
    { object: { foo: {} } },
    { type: "object", properties: { foo: {} } }
  );
});

test("expands array", () => {
  shorthandOk(
    { array: ["number"] },
    { type: "array", items: [{ type: "number" }] }
  );
});

test("expands array", () => {
  shorthandOk(
    { array: ["number"] },
    { type: "array", items: [{ type: "number" }] }
  );
});

test("misc", () => {
  shorthandOk(
    { properties: { foo: { required: true } } },
    { required: ["foo"], properties: { foo: {} } },
    "expands required"
  );

  shorthandOk(
    { properties: { foo: "number!", bar: "#baz!" } },
    {
      required: ["foo","bar"],
      properties: {
        foo: { type: "number" },
        bar: { $ref: "#baz" },
      },
    },
    "expands required when using !"
  );

  ["allOf", "anyOf", "oneOf"].forEach((keyword) => {
    let short = {};
    short[keyword] = ["number"];

    let expected = {};

    expected[keyword] = [{ type: "number" }];

    shorthandOk(short, expected);
  });

  shorthandOk(
    { $defs: { foo: "object" } },
    { $defs: { foo: { type: "object" } } },
    "expands definitions"
  );

  shorthandOk({ not: "object" }, { not: { type: "object" } }, "expands not");
});

test("ref", () => {
  shorthandOk("#foo", { $ref: "#foo" }, "expands #ref");
  shorthandOk("$http://foo", { $ref: "http://foo" }, "expands $ref");
});

test("array", () => {
  shorthandOk(
    { array: "number" },
    { type: "array", items: { type: "number" } },
    "expands items"
  );
  shorthandOk(
    { type: "array", items: "number" },
    { type: "array", items: { type: "number" } },
    "expands items"
  );

  shorthandOk(
    { type: "array", items: { type: "number" } },
    { type: "array", items: { type: "number" } },
    "expands items"
  );

  shorthandOk(
    { type: "array", items: ["number"] },
    { type: "array", items: [{ type: "number" }] },
    "expands items"
  );
});
