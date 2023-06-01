import u from "@yanick/updeep-remeda";
import { createPipe, pickBy, prop } from "remeda";
import * as R from "remeda";

const isString = function (target: any): target is string {
  return typeof target === "string";
};

function groomRange(min: number, max: number, min_inc = true, max_inc = true) {
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

export function shorthand<S>(schema: S): ExpandShorthand<S> {
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

const simpleDef = <S extends string>(type: S) =>
  ((...options) => mergeDefs({ type }, ...options)) as SimpleDef<S>;

interface SimpleDef<T> {
  (): { type: T };
  (description: string): { type: T; description: string };
  <O extends {}>(description: string, schema: O): {
    type: T;
    description: string;
  } & ExpandShorthand<O>;
  <O extends {}>(schema: O): { type: T } & ExpandShorthand<O>;
}

export const number = simpleDef("number");
export const integer = simpleDef("integer");
export const string = simpleDef("string");
export const boolean = simpleDef("boolean");
const _null = simpleDef("null");
export { _null as null };

interface ArrayDef {
  (): { type: "array" };
  <I>(items: I): ExpandShorthand<{ array: I }>;
  <I, Q extends Record<any, any>>(items: I, extra: Q): ExpandShorthand<
    { array: I } & Q
  >;
}

export const array: ArrayDef = (...args) => {
  const schema: any = {
    type: "array",
  };

  if (args.length) schema.items = args.shift();

  return mergeDefs(schema, ...args);
};

interface ObjectDef {
  (): { type: "object" };
  <P extends {}>(properties: P): ExpandShorthand<{ object: P }>;
  <S extends string>(desc: S): { type: "object"; description: S };
  <S extends string, P extends {}>(desc: S, properties: P): RequiredProperties<{
    type: "object";
    properties: {
      [k in keyof P]: ExpandShorthand<P[k]>;
    };
  }> & { description: S };
  <S extends string, P extends {}, Q extends {}>(
    desc: S,
    properties: P,
    extra: Q
  ): ExpandShorthand<
    { type: "object"; description: S; properties: ExpandShorthand<P> } & Q
  >;
  <P extends {}, Q extends {}>(properties: P, extra: Q): ExpandShorthand<
    { object: P } & Q
  >;
}

export const object: ObjectDef = (...args) => {
  let schema: any = {
    type: "object",
  };

  if (typeof args[0] === "string") {
    schema.description = args.shift();
  }

  const properties = args.shift();
  schema = u(schema, { properties });

  return mergeDefs(schema, ...args);
};

const combinatory =
  (key) =>
  (parts, extra = {}) => ({
    [key]: map_shorthand(parts),
    ...extra,
  });

interface Combi<X extends string> {
  <S>(schema: S): ExpandShorthand<Record<X, S>>;
}

export const allOf = combinatory("allOf") as Combi<"allOf">;
export const anyOf: Combi<"anyOf"> = combinatory("anyOf") as any;
export const oneOf: Combi<"oneOf"> = combinatory("oneOf") as any;
export const not: Combi<"not"> = (inner) =>
  ({
    not: shorthand(inner),
  } as any);
