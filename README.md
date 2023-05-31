# json-schema-shorthand

[JSON Schema](http://json-schema.org/) is a useful beast,
but its schema definition can be a little bit more long-winded
than necessary. This module allows to use a few shortcuts that
will be expanded into their canonical form.

## To install

    npm install json-schema-shorthand

## Typical use

    import * as j from 'json-schema-shorthand';

    let schema = j.object({
        foo: 'number',
        bar: array('string'),
    });

    // schema === {
    //    type: 'object',
    //    properties: {
    //        foo: { type: 'number' },
    //        bar: { type: 'array', items: { type: 'string' } }
    //    }
    // }

## Compatibility with [json-schema-to-ts](https://www.npmjs.com/package/json-schema-to-ts)

`json-schema-shorthand` can be used in conjecture with `json-schema-to-ts`.
Just remember to `as const` your schemas to get the most precise types out
of `FromSchema<>`.

const res = shorthand({
object: {
foo: "number!",
},
} as const);

expectTypeOf(s).toMatchTypeOf<{
foo: number;
}>();

## Functions

### `j.shorthand( schema )`

Takes in a data structure
and expands any shorthand (see next section) found in it. Note that because
`json-schema-shorthand` is using
[@yanick/updeep-remeda](https://www.npmjs.com/package/@yanick/updeep-remeda) internally, the returned schema
is [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze).

Also the default export of `json-schema-shorthand`.

    let schema = j.shorthand( { object: { foo: 'number' } });
    // => { type: 'object', properties: { foo: { type: 'number' } } }

### `number( description?, schema? )`

    let schema = number( 'number of thingies', { maximum: 5 });
    // => { type: 'number', description: 'number of thingies', maximum: 5 }

Expands into a number type.

### `integer( description?, schema? )`

    let schema = integer({ maximum: 5 });
    // => { type: 'integer', maximum: 5 }

Expands into an integer type.

### `string( description?, schema? )`

    let schema = string({ maxLength: 5 });
    // => { type: 'string', maxLength: 5 }

Expands into a string type.

### `array( itemsSchema, schema? )`

    let schema = array('number', { maxItems: 5 });
    // => { type: 'array', items: { type: 'number' }, maxItems: 5 }

Expands into an array type.

### `object( description?, properties, schema? )`

    let schema = object({ foo: 'string!' }, { description: "yadah" });
    // => { type: 'object',
    //      properties: { foo: { type: 'string' } },
    //      required: [ 'foo' ],
    //      description: "yadah" }

Expands into an object type.

### `allOf(schemas,extra)`, `oneOf(schemas,extra)`, `anyOf(schemas, extra)`

    let schema = allOf(array(), { items: 'number' });
    // => { allOf: [
    //      { type: 'array' },
    //      { items: { type: number } }
    //    ] }

Same for `oneOf` and `anyOf`.

### `not(description?, schema)`

    let schema = not(array());
    // => { not: { type: 'array' } }

## Shorthands

### Types as string

If a string `type` is encountered where a property definition is
expected, the string is expanded to the object `{ "type": type }`.

    {
        "foo": "number",
        "bar": "string"
    }

expands to

    {
        "foo": { "type": "number" },
        "bar": { "type": "string" }
    }

If the string begins with a `#`, the type is assumed to be a local reference and
`#type` is expanded to `{ "$ref": type }`.

    { "foo": "#/definitions/bar" }

becomes

    { "foo": { "$ref": "#/definitions/bar" } }

If the string begins with a `$`, the type is assumed to be a general reference and
`$type` is expanded to `{ "$ref": type }`.

    { "foo": "$http://foo.com/bar" }

becomes

    { "foo": { "$ref": "http://foo.com/bar" } }

### `object` property

`{ object: properties }` expands to `{ type: "object", properties }`.

    shorthand                              expanded
    ------------------------               ---------------------------
    foo: {                                  foo: {
        object: {                               type: "object",
            bar: { }                            properties: {
        }                                           bar: { }
    }                                           }
                                            }

### `array` property

`{ array: items }` expands to `{ type: "array", items }`.

    shorthand                              expanded
    ------------------------               ---------------------------
    foo: {                                  foo: {
        array: 'number'                         type: "array",
    }                                           items: {
                                                    type: 'number'
                                                }
                                            }

### `required` property

If the `required` attribute is set to `true` for a property, it is bubbled
up to the `required` attribute of its parent object.

    shorthand                              expanded
    ------------------------               ---------------------------

    foo: {                                  foo: {
        properties: {                           required: [ 'bar' ],
          bar: { required: true },              properties: {
          baz: { }                                bar: {},
        }                                         baz: {}
    }                                       }

The type or `$ref` of a field can also be appended a `!` to mark it
as required.

    shorthand                              expanded
    ------------------------               ---------------------------

    foo: {                                  foo: {
        properties: {                           required: [ 'bar', 'baz' ],
          bar: 'number!'                        properties: {
          baz: '#baz_type!'                       bar: {   type: 'number' },
        }                                         baz: { '$ref': '#baz_type' }
    }                                       }
