import tap from "tap";

import { add_definition, number } from ".";

tap.test("with .bind()", async (t) => {
  let defs = {};
  const add_def = add_definition.bind(defs);

  let foo = add_def("foo", number());

  t.same(defs, { foo: { type: "number" } });
  t.same(foo, { $ref: "#/definitions/foo" });
});
