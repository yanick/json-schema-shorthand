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

tap.test( 'ref', t => {
    t.shorthand( '#foo', { '$ref': '#foo' }, 'expands #ref' );
    t.shorthand( '$http://foo', { '$ref': 'http://foo' }, 'expands $ref' );

    t.end();
});

tap.test( 'array', t => {
    t.shorthand( { 'array': 'number' }, { type: 'array', items: { type: 'number' } }, 'expands items' );

    t.shorthand( { type: 'array', items: 'number' }, { type: 'array', items: { type: 'number' } }, 'expands items' );

    t.shorthand( { type: 'array', items: { type: 'number' } }, { type: 'array', items: { type: 'number' } }, 'expands items' );

    t.shorthand(
        { type: 'array', items: [ 'number' ] },
        { type: 'array', items: [ { type: 'number' } ] },
        'expands items' 
    );

    t.end();
});


tap.test( 'range', t => {

    t.shorthand( 
        { type: 'number', range: [ 5, 8, true, false ] },
        { type: 'number', minimum: 5, exclusiveMaximum: 8 }
    );

    t.shorthand( 
        { type: 'number', range: [ 5, 8 ] },
        { type: 'number', minimum: 5, maximum: 8 }
    );

    t.shorthand( 
        { type: 'number', range: [ 5, 8, true ] },
        { type: 'number', minimum: 5, maximum: 8 }
    );

    t.shorthand( 
        { type: 'number', range: [ 5, 8, false ] },
        { type: 'number', exclusiveMinimum: 5, maximum: 8 }
    );


    t.end();
});
