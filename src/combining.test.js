import tap from "tap";

import * as jssh from "./index";

for (let c of ["allOf", "anyOf", "oneOf"]) {
  tap.test(c, async t => {
    t.same(jssh[c]({ type: "object", properties: true }, "number"), {
      [c]: [{ type: "object", properties: true }, { type: "number" }]
    });
  });
}

tap.test("not", async t => {
  t.same(jssh.not("number"), {
    not: { type: "number" }
  });
});
