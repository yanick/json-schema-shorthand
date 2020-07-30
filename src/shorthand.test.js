import tap from "tap";

import _ from "lodash";

import shorthand from "./index";

tap.Test.prototype.addAssert("shorthand_ok", 2, function(
  received,
  expected,
  desc,
  extra
) {
  desc = desc || "shorthand ok";

  return this.same(shorthand(received), expected, desc, extra);
});

tap.test("shortcuts", async t => {
  t.shorthand_ok(undefined, {}, 'passing "undefined"');

  t.shorthand_ok("string", { type: "string" }, "type as string");

  t.shorthand_ok(
    { object: { foo: "string" } },
    { type: "object", properties: { foo: { type: "string" } } },
    "object property"
  );

  t.shorthand_ok(
    { object: { foo: {} } },
    { type: "object", properties: { foo: {} } },
    "expands objects"
  );

  t.shorthand_ok(
    { array: ["number"] },
    { type: "array", items: [{ type: "number" }] },
    "expands array"
  );

  t.shorthand_ok(
    { array: "number" },
    { type: "array", items: { type: "number" } },
    "expands array"
  );

  t.shorthand_ok(
    { properties: { foo: { required: true } } },
    { required: ["foo"], properties: { foo: {} } },
    "expands required"
  );

  t.shorthand_ok(
    { properties: { foo: "number!", bar: "#baz!" } },
    {
      required: ["bar", "foo"],
      properties: {
        foo: { type: "number" },
        bar: { $ref: "#baz" }
      }
    },
    "expands required when using !"
  );

  ["allOf", "anyOf", "oneOf"].forEach(keyword => {
    let short = {};
    short[keyword] = ["number"];

    let expected = {};

    expected[keyword] = [{ type: "number" }];

    t.shorthand_ok(short, expected);
  });

  t.shorthand_ok(
    { definitions: { foo: "object" } },
    { definitions: { foo: { type: "object" } } },
    "expands definitions"
  );

  t.shorthand_ok({ not: "object" }, { not: { type: "object" } }, "expands not");
});

tap.test("ref", async t => {
  t.shorthand_ok("#foo", { $ref: "#foo" }, "expands #ref");
  t.shorthand_ok("$http://foo", { $ref: "http://foo" }, "expands $ref");
});

tap.test("array", async t => {
  t.shorthand_ok(
    { array: "number" },
    { type: "array", items: { type: "number" } },
    "expands items"
  );

  t.shorthand_ok(
    { type: "array", items: "number" },
    { type: "array", items: { type: "number" } },
    "expands items"
  );

  t.shorthand_ok(
    { type: "array", items: { type: "number" } },
    { type: "array", items: { type: "number" } },
    "expands items"
  );

  t.shorthand_ok(
    { type: "array", items: ["number"] },
    { type: "array", items: [{ type: "number" }] },
    "expands items"
  );
});

tap.test("range", async t => {
  t.shorthand_ok(
    { type: "number", range: [5, 8, true, false] },
    { type: "number", minimum: 5, exclusiveMaximum: 8 }
  );

  t.shorthand_ok(
    { type: "number", range: [5, 8] },
    { type: "number", minimum: 5, maximum: 8 }
  );

  t.shorthand_ok(
    { type: "number", range: [5, 8, true] },
    { type: "number", minimum: 5, maximum: 8 }
  );

  t.shorthand_ok(
    { type: "number", range: [5, 8, false] },
    { type: "number", exclusiveMinimum: 5, maximum: 8 }
  );
});

tap.test("nbrItems", async t => {
  t.shorthand_ok(
    { type: "array", nbrItems: [5, 8] },
    { type: "array", minItems: 5, maxItems: 8 }
  );

  t.shorthand_ok(
    { type: "array", nbrItems: 9 },
    { type: "array", minItems: 9, maxItems: 9 }
  );
});
