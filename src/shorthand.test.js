import _ from 'lodash';

import shorthand from './index';

const shorthand_ok = ( received, expected, desc ) => {
    if(!desc) desc = JSON.stringify(received);
    test( desc, () => expect( shorthand( received ) ).toEqual(expected ) );
};

describe( 'shortcuts', () =>{

    shorthand_ok( undefined, {}, 'passing "undefined"' );

    shorthand_ok( 'string', { type: 'string' }, 'type as string' );

    shorthand_ok( { object: { foo: 'string' } },  
        { type: 'object', properties: { foo: { type: 'string' } } },
        'object property'
    );

    shorthand_ok( { object: { foo: {}  } }, 
        { type: 'object', properties: { foo: { } } },
        'expands objects' 
    );

    shorthand_ok(
        { array: [ 'number' ] },
        { type: 'array', items: [ { type: 'number' } ] },
        'expands array');

    shorthand_ok(
        { array: 'number' },
        { type: 'array', items:  { type: 'number' }  },
        'expands array');

    shorthand_ok( { properties: { foo: { required: true } } },
        { required: [ 'foo' ], properties: { foo: { } } },
        'expands required' );

    shorthand_ok( { properties: { foo: 'number!', bar: '#baz!' } },
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

            shorthand_ok( short, expected );
    });

    shorthand_ok(
        { 'definitions': { "foo": 'object' }},
        { definitions: { foo: { type: 'object' } } },
        'expands definitions'
    );

    shorthand_ok( 
        { 'not': 'object' },
        { not: { type: 'object' } },
        'expands not' 
    );


});

describe( 'ref', () =>{
    shorthand_ok( '#foo', { '$ref': '#foo' }, 'expands #ref' );
    shorthand_ok( '$http://foo', { '$ref': 'http://foo' }, 'expands $ref' );

});

describe( 'array', () =>{
    shorthand_ok( { 'array': 'number' }, { type: 'array', items: { type: 'number' } }, 'expands items' );

    shorthand_ok( { type: 'array', items: 'number' }, { type: 'array', items: { type: 'number' } }, 'expands items' );

    shorthand_ok( { type: 'array', items: { type: 'number' } }, { type: 'array', items: { type: 'number' } }, 'expands items' );

    shorthand_ok(
        { type: 'array', items: [ 'number' ] },
        { type: 'array', items: [ { type: 'number' } ] },
        'expands items' 
    );

});


describe( 'range', () =>{

    shorthand_ok( 
        { type: 'number', range: [ 5, 8, true, false ] },
        { type: 'number', minimum: 5, exclusiveMaximum: 8 }
    );

    shorthand_ok( 
        { type: 'number', range: [ 5, 8 ] },
        { type: 'number', minimum: 5, maximum: 8 }
    );

    shorthand_ok( 
        { type: 'number', range: [ 5, 8, true ] },
        { type: 'number', minimum: 5, maximum: 8 }
    );

    shorthand_ok( 
        { type: 'number', range: [ 5, 8, false ] },
        { type: 'number', exclusiveMinimum: 5, maximum: 8 }
    );


});

describe( 'nbrItems', () =>{

    shorthand_ok( 
        { type: 'array', nbrItems: [ 5, 8 ] },
        { type: 'array', minItems: 5, maxItems: 8 }
    );

    shorthand_ok( 
        { type: 'array', nbrItems: 9 },
        { type: 'array', minItems: 9, maxItems: 9 }
    );

});
