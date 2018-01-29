import shorthand from '../src/json-schema-shorthand';
const tap = require('tap');

tap.Test.prototype.addAssert('shorthand', 2, function(observed, expected, message, extra) {
    return this.same( shorthand(observed), expected,  message, extra );
});

tap.test( 'shortcuts', t => {

    t.shorthand( undefined, {}, 'passing "undefined"' );

    t.shorthand( 'string', { type: 'string' }, 'type as string' );

    t.shorthand( { object: { foo: 'string' } },  
        { type: 'object', properties: { foo: { type: 'string' } } },
        'object property'
    );

    t.shorthand( '#foo', { '$ref': '#foo' }, 'expands #ref' );

    t.shorthand( { object: { foo: {}  } }, 
        { type: 'object', properties: { foo: { } } },
        'expands objects' 
    );

    t.shorthand(
        { array: [ 'number' ] },
        { type: 'array', items: [ { type: 'number' } ] },
        'expands array');

    t.shorthand(
        { array: 'number' },
        { type: 'array', items:  { type: 'number' }  },
        'expands array');

    t.shorthand( { properties: { foo: { required: true } } },
        { required: [ 'foo' ], properties: { foo: { } } },
        'expands required' );

    t.shorthand( { properties: { foo: 'number!', bar: '#baz!' } },
        {
            required: [ 'bar', 'foo' ], 
            properties: { 
                foo: { type: 'number' },
                bar: { '$ref': '#baz' } 
            } 
        },
        'expands required when using !' );

    [ 'allOf', 'anyOf', 'oneOf' ].forEach( keyword => {
            let short = {};
            short[keyword] = [ 'number' ];

            let expected = {};

            expected[keyword] = [ { type: 'number' } ];

            t.shorthand( short, expected );
    });

    t.shorthand(
        { 'definitions': { "foo": 'object' }},
        { definitions: { foo: { type: 'object' } } },
        'expands definitions'
    );

    t.shorthand( 
        { 'not': 'object' },
        { not: { type: 'object' } },
        'expands not' 
    );

    t.end();

});
