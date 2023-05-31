import { test, expect } from "vitest";

import * as schema from "./index.js";

test.each(["allOf", "anyOf", "oneOf"])("%s", (c) => {
  expect(
    schema[c]([{ type: "object", properties: true }, "number"])
  ).toMatchObject({
    [c]: [{ type: "object", properties: true }, { type: "number" }],
  });
});

test("not", () => {
  expect(schema.not("number")).toMatchObject({
    not: { type: "number" },
  });
});
