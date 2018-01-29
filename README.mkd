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

    var shorthand = require('json-schema-shorthand').default;

    var abbrev = {
        object: {
            foo: 'number',
            bar: {
                array: 'string'
            },
        }
    };

    var expanded = shorthand( abbrev );
    // expanded === {
    //    type: 'object',
    //    properties: {
    //        foo: { type: 'number' },
    //        bar: { type: 'array', items: { type: 'string' } }
    //    }
    // }

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




