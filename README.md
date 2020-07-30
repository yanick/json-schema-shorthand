# json-schema-shorthand

[JSON Schema](http://json-schema.org/) is a useful beast, 
but its schema definition can be a little bit more long-winded
than necessary. This module allows to use a few shortcuts that
will be expanded into their canonical form.

**WARNING**: the module is still very young, and there are plenty of
properties this module should expand and does not. So don't trust it
blindly. If you  hit such a case, raise a ticket and I'll refine the process.

## To install

    npm install json-schema-shorthand

## Typical use

    import shorthand, { object, array } from 'json-schema-shorthand';

    let schema = object({
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

## Functions

The `schemaParts` that most of those functions take is a list
of simple arrays that will be merged together to form the final 
schema (which will be then expanded via `shorthand()`. If a
`schemaParts` item is a string, it'll be expanded as a description
attribute. 

For example:

    object({ foo: 'number' }, "a thing", { minProperties: 3 } )

    // => {
    //    type: "object",
    //    properties: { foo: { type: "number" } },
    //    description: "a thing",
    //    minProperties: 3
    // }

Also, under the hood the merging of all the `schemaParts` is done via 
`updeep`, so you could potentially do funkier things than just pass
litteral values to it. Just sayin'.


### `shorthand( schema )`

The default export of `json-schema-shorthand`. Takes in a data structure
and expands any shorthand (see next section) found in it. Note that because
`json-schema-shorthand` is using
[updeep](https://github.com/substantial/updeep) internally, the returned schema 
is [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze).

### `number( ...schemaParts )`

    let schema = number({ maximum: 5 });
    // => { type: 'number', maximum: 5 }

Expands into a number type.

### `integer( ...schemaParts )`

    let schema = integer({ maximum: 5 });
    // => { type: 'integer', maximum: 5 }

Expands into a integer type.

### `string( ...schemaParts )`

    let schema = string({ maxLength: 5 });
    // => { type: 'string', maxLength: 5 }

Expands into a string type.

### `array( itemsSchema, ...schemaParts )`

    let schema = array('number', { maxItems: 5 });
    // => { type: 'array', items: { type: 'number' }, maxItems: 5 }

Expands into an array type.

### `object( properties, ...schemaParts )`

    let schema = object({ foo: 'string!' }, { description: "yadah" });
    // => { type: 'object', 
    //      properties: { foo: { type: 'string' } }, 
    //      required: [ 'foo' ],
    //      description: "yadah" }

Expands into an object type.


### `allOf(...schemas)`, `oneOf(...schemas)`, `anyOf(...schemas)`

    let schema = allOf(array(), { items: 'number' });
    // => { allOf: [ 
    //      { type: 'array' }, 
    //      { items: { type: number } } 
    //    ] }

Same for `oneOf` and `anyOf`.

### `not(schema)`

    let schema = not(array());
    // => { not: { type: 'array' } } 


### `add_definition( name, ...schemaParts )`

If using Babel and
[babel-plugin-transform-function-bind](https://babeljs.io/docs/plugins/transform-function-bind/):

    import { add_definition, object } from 'json-schema-shorthand';

    let definitions = {};
    let thingy = definitions::add_definition( 'thingy', 'string' );
    // thingy === { '$ref': '#/definitions/thingy' }

    let schema = object({
        foo: thingy
    }, {
        definitions,
    });
    // ==> {
    //    definitions: { thingy: { type: 'string' } },
    //    type: 'object',
    //    properties: {
    //        foo: { '$ref': '#/definitions/thingy },
    //    }
    //}

Using good ol' `bind()`:

    import { add_definition, object } from 'json-schema-shorthand';

    let definitions = {};
    const add_def = add_definition.bind(definitions);

    let thingy = add_def( 'thingy', 'string' );

    let schema = object({
        foo: thingy
    }, {
        definitions,
    });

In both versions, `add_definition`  will add the provided
definition to its context (with all shorthands expanded, natch) and
return its related schema pointer so that, if assigned to a variable,
it can be used as a type shortcut.

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


### `range` property

Shortcut to set `minimum` and `maximum` in a single array. Two boolean values
can also be provided to specify if the extrema are inclusive (`true` by
default).

    shorthand                              expanded
    ------------------------               ---------------------------

    foo: {                                  foo: {
        type: 'number',                         type: 'number',
        range: [ 5, 8, true, false ]             minimum: 5,
    }                                            exclusiveMaximum: 8,
                                            }
