import u from "@yanick/updeep-remeda";
import { createPipe, pickBy, prop } from "remeda";
import * as R from "remeda";

const isString = function (target: any): target is string {
  return typeof target === "string";
};

/**
 * @typedef { import('json-schema').JSONSchema6Type } JSONSchema6Type
 */

/**
 * @typedef { string | object | null | JSONSchema6Type } SchemaPart
 */

/**
 * @param {number} min
 * @param {number} max
 * @param {boolean} [minInc=true]
 * @param {boolean} [maxInc=true]
 */
function groomRange(min, max, min_inc = true, max_inc = true) {
  return {
    [min_inc ? "minimum" : "exclusiveMinimum"]: min,
    [max_inc ? "maximum" : "exclusiveMaximum"]: max,
  };
}

const processIfHas = (prop, update) => (obj: any) => {
  return u.if(obj, prop in obj, update);
};

const process_nbrItems = processIfHas("nbrItems", (obj) => {
  const { nbrItems } = obj;
  const [minItems, maxItems] = Array.isArray(nbrItems)
    ? nbrItems
    : [nbrItems, nbrItems];

  return u({ minItems, maxItems, nbtItems: u.skip }, obj);
});

const process_range = processIfHas(
  "range",
  createPipe((obj: any) =>
    u(groomRange(...(obj.range as [number, number]), obj), u.omit(["range"]))
  )
);

//  expand the shorthand content of `items`
const expand_items = processIfHas("items", {
  items: (items) =>
    Array.isArray(items) ? items.map(shorthand) : shorthand(items),
});

function groom_required_properties(obj) {
  if (!obj.properties) return obj;

  let required = obj.required || [];

  required = required.concat(
    Object.keys(pickBy(obj.properties, prop("required")))
  );
  required.sort();

  return u({
    required: u.if(required.length > 0, required),
    properties: u.map(u.omit(["required"])),
  })(obj);
}

const process_array = processIfHas(
  "array",
  createPipe(
    u(({ array: items }) => ({
      type: "array",
      items,
    })),
    u.omit(["array"])
  )
);

const process_object = processIfHas(
  "object",
  createPipe(
    u(({ object: properties }) => ({ type: "object", properties })),
    u.omit(["object"])
  )
);

const map_shorthand = u.if((x) => x, u.map(shorthand));

const expand_shorthands = u({
  not: u.if((x) => x, shorthand),
  definitions: map_shorthand,
  properties: map_shorthand,
  anyOf: map_shorthand,
  allOf: map_shorthand,
  oneOf: map_shorthand,
});

const expandString = u.if(isString, (obj) =>
  obj[0] === "$"
    ? { $ref: obj.slice(1) }
    : { [obj[0] === "#" ? "$ref" : "type"]: obj }
);

const basicType = [
  "string",
  "number",
  "integer",
  "object",
  "array",
  "null",
  "boolean",
] as const;

type BasicType = typeof basicType[number];

type ReqProps<P> = {
  [k in keyof P]: P[k] extends { required: true } ? k : never;
};

type RemoveReq<P> = {
  [k in keyof P]: Omit<P[k], "required">;
};

type RequiredProperties<T> = T extends { properties: infer P }
  ? Omit<T, "properties"> & {
      properties: RemoveReq<P>;
      required: ReqProps<P>[keyof P][];
    }
  : T;

type InnerExpandShorthand<T> = T extends `${infer X}!`
  ? ExpandShorthand<X> & { required: true }
  : T extends `#${infer X}`
  ? { $ref: T }
  : T extends `$${infer X}`
  ? { $ref: X }
  : T extends string
  ? { type: T }
  : T extends { $defs: infer D }
  ? ExpandShorthand<Omit<T, "$defs">> & {
      $defs: { [k in keyof D]: ExpandShorthand<D[k]> };
    }
  : T extends { not: infer A }
  ? { not: ExpandShorthand<A> }
  : T extends { anyOf: infer A }
  ? { anyOf: { [k in keyof A]: ExpandShorthand<A[k]> } }
  : T extends { allOf: infer A }
  ? { allOf: { [k in keyof A]: ExpandShorthand<A[k]> } }
  : T extends { oneOf: infer A }
  ? { oneOf: { [k in keyof A]: ExpandShorthand<A[k]> } }
  : T extends { object: infer P }
  ? Omit<T, "object"> &
      RequiredProperties<{
        type: "object";
        properties: {
          [k in keyof P]: ExpandShorthand<P[k]>;
        };
      }>
  : T extends { array: infer A }
  ? Omit<T, "array"> & { type: "array"; items: ExpandShorthand<A> }
  : RequiredProperties<T>;

type ExpandShorthand<T> = InnerExpandShorthand<T>;

const isBasicType = (s: any): s is BasicType => basicType.includes(s);

function shorthand<S>(schema: S): ExpandShorthand<S> {
  if (typeof schema === "string") {
    if (schema.endsWith("!"))
      return {
        ...(shorthand(schema.replace("!", "")) as any),
        required: true,
      } as any;

    if (schema.startsWith("#"))
      return {
        $ref: schema,
      } as any;

    if (schema.startsWith("$"))
      return {
        $ref: schema.replace("$", ""),
      } as any;

    return { type: schema } as any;
  }

  if (typeof schema !== "object") return schema as any;

  let sc: any = schema;

  sc = u.if(sc, R.prop("object"), {
    properties: sc.object,
    object: u.skip,
    type: "object",
  });

  sc = u.if(sc, R.prop("array"), {
    items: sc.array,
    array: u.skip,
    type: "array",
  });

  sc = u.if(sc, R.prop("properties"), {
    properties: u.map(shorthand),
  });

  sc = u.if(sc, R.prop("items"), {
    items: (i) => (Array.isArray(i) ? u.map(i, shorthand) : shorthand(i)),
  });

  if (sc.properties) {
    const reqProps = Object.keys(sc.properties ?? {}).filter(
      (k) => sc.properties[k].required
    );
    if (reqProps.length) {
      if (!sc.required) sc = u(sc, { required: [] });
      sc = u.updateIn(sc, "required", (r) => [...r, ...reqProps]);
    }
    sc = u.updateIn(sc, "properties", u.map({ required: u.skip }));
  }

  ["anyOf", "allOf", "oneOf"]
    .filter((op) => sc[op])
    .forEach((op) => {
      sc = u.updateIn(sc, op, u.map(shorthand));
    });

  sc = u.updateIn(sc, "not", shorthand);

  if (sc.$defs) {
    sc = u.updateIn(sc, "$defs", R.mapValues(shorthand));
  }

  return sc;
}

export default shorthand;
// export default function shorthand(obj = {}) {
//   const x = ["$ref", "type"] as const;
//     const y = x.map((field) =>
//       u.if((obj) => /!$/.test(obj[field]), {
//         required: true,
//         [field]: (v) => v.replace(/!$/, ""),
//       })
//     ) as [any];
//   return (createPipe as any)(
//     expandString,
//         ...y,
//     process_object,
//     expand_shorthands,
//     process_array,
//     groom_required_properties,
//     expand_items,
//     process_nbrItems,
//     process_range
//   )(obj);
// }

function mergeDefs(...defs) {
  return shorthand(
    defs
      .map((d) => (isString(d) ? { description: d } : d))
      .reduce((merged, addition) => u(addition)(merged), {})
  );
}

interface SimpleDef2<T> {
  <D extends Record<string, any>>(description: string, d: D): {
    description: string;
    type: T;
  } & D;
  (description: string): {
    description: string;
    type: T;
  };
  <D extends Record<string, any>>(d: D): { type: T } & D;
}

const simpleDef =
  (type: string) =>
  (...options) =>
    mergeDefs({ type }, ...options);

export const number = simpleDef("number");
export const integer = simpleDef("integer");
export const string = simpleDef("string");

export const array = (items = null, ...options) =>
  mergeDefs({ type: "array", items: u.if(!!items, items) }, ...options);

export const object = (properties = null, ...options) =>
  mergeDefs(
    {
      type: "object",
      properties: u.if(!!properties, properties),
    },
    ...options
  );

/** @type (key: string) => (...parts: SchemaPart[]) => Record<string, JSONSchema6Type>
 */
const combinatory =
  (key) =>
  (...parts) => ({
    [key]: map_shorthand(parts),
  });

export const allOf = combinatory("allOf");
export const anyOf = combinatory("anyOf");
export const oneOf = combinatory("oneOf");
export const not = (inner) => ({
  not: shorthand(inner),
});
