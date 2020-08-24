import fp from "lodash/fp";
import u from "updeep";
import { JSONSchema6Type } from "json-schema";

import isString from "lodash/isString";

type SchemaPart = string | object | null | JSONSchema6Type;

function groomRange(min: number, max: number, min_inc = true, max_inc = true) {
  return {
    [min_inc ? "minimum" : "exclusiveMinimum"]: min,
    [max_inc ? "maximum" : "exclusiveMaximum"]: max
  };
}

const process_if_has = fp.curry(function(prop: string, update: any, obj: any) {
  return u.if(fp.has(prop), update, obj);
});

const process_nbrItems = process_if_has(
  "nbrItems",
  (obj: { nbrItems: number }) => {
    const { nbrItems } = obj;
    const [minItems, maxItems] = Array.isArray(nbrItems)
      ? nbrItems
      : [nbrItems, nbrItems];

    return fp.flow([u({ minItems, maxItems }), u.omit("nbrItems")])(obj);
  }
);

const process_range = process_if_has(
  "range",
  fp.flow([obj => u((groomRange as any)(...obj.range), obj), u.omit(["range"])])
);

//  expand the shorthand content of `items`
const expand_items = process_if_has("items", {
  items: (items: {} | undefined) =>
    Array.isArray(items) ? items.map(shorthand) : shorthand(items)
});

function groom_required_properties(obj: { properties: {}; required: any[] }) {
  if (!obj.properties) return obj;

  let required = obj.required || [];

  required = required.concat(
    Object.keys(fp.pickBy("required", obj.properties))
  );
  required.sort();

  return u({
    required: u.if(required.length > 0, required),
    properties: u.map(u.omit("required"))
  })(obj);
}

const process_array = process_if_has(
  "array",
  fp.flow([
    u(({ array: items }: any) => ({
      type: "array",
      items
    })),
    u.omit(["array"])
  ])
);

const process_object = process_if_has(
  "object",
  fp.flow([
    u(({ object: properties }: any) => ({ type: "object", properties })),
    u.omit(["object"])
  ])
);

const map_shorthand = u.if(fp.identity, u.map(shorthand));

const expand_shorthands = u({
  not: u.if(fp.identity, shorthand),
  definitions: map_shorthand,
  properties: map_shorthand,
  anyOf: map_shorthand,
  allOf: map_shorthand,
  oneOf: map_shorthand
});

const expandString = u.if(isString, (obj: string) =>
  obj[0] === "$"
    ? { $ref: obj.slice(1) }
    : { [obj[0] === "#" ? "$ref" : "type"]: obj }
);

export default function shorthand(obj = {}): JSONSchema6Type {
  return fp.flow([
    expandString,
    ...["$ref", "type"].map(field =>
      u.if((obj: any) => /!$/.test(obj[field]), {
        required: true,
        [field]: (v: string) => v.replace(/!$/, "")
      })
    ),
    process_object,
    expand_shorthands,
    process_array,
    groom_required_properties,
    expand_items,
    process_nbrItems,
    process_range
  ])(obj);
}

function merge_defs(...defs: SchemaPart[]) {
  return shorthand(
    defs
      .map((d: any) => (isString(d) ? { description: d } : d))
      .reduce((merged, addition) => u(addition)(merged), {})
  );
}

const simple_def = (type: string) => (...options: SchemaPart[]) =>
  merge_defs({ type }, ...options);

export const number = simple_def("number");
export const integer = simple_def("integer");
export const string = simple_def("string");

export const array = (items: any = null, ...options: SchemaPart[]) =>
  merge_defs({ type: "array", items: u.if(!!items, items) }, ...options);

export const object = (properties: any = null, ...options: SchemaPart[]) =>
  merge_defs(
    {
      type: "object",
      properties: u.if(!!properties, properties)
    },
    ...options
  );

const combinatory = (key: string) => (...parts: SchemaPart[]) => ({
  [key]: map_shorthand(parts)
});

export const allOf = combinatory("allOf");
export const anyOf = combinatory("anyOf");
export const oneOf = combinatory("oneOf");
export const not = (inner: {} | undefined) => ({
  not: shorthand(inner)
});

export function add_definition(
  this: Record<string, JSONSchema6Type>,
  name: string,
  ...schemas: JSONSchema6Type[]
) {
  this[name] = merge_defs(...schemas);
  return { $ref: "#/definitions/" + name };
}
