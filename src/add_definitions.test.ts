import { test, expect } from 'vitest';

import { add_definition, number } from "./index.js";

test("with .bind()", () => {
  let defs = {};
  const add_def = add_definition.bind(defs);

  let foo = add_def("foo", number());

    expect(defs).toMatchObject({ foo: { type: "number" } });
    expect(foo).toMatchObject({ $ref: "#/definitions/foo" });
});
