import {
  shorthand,
  add_definition,
  object,
  array,
  number,
  integer,
  string
} from "./index";

test("with .bind()", () => {
  let defs = {};
  const add_def = add_definition.bind(defs);

  let foo = add_def("foo", number());

  expect(defs).toEqual({ foo: { type: "number" } });
  expect(foo).toEqual({ $ref: "#/definitions/foo" });
});
