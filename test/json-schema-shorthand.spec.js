import shorthand from '../src/json-schema-shorthand';
const chai = require('chai');
const expect = chai.expect;

describe( 'shortcuts', () => {

    it( 'type as string', () => {

        expect( shorthand( 'string') ).deep.equal( { type: 'string' } );

        expect( shorthand( { object: { foo: 'string' } } ) )
            .deep.equal( { type: 'object', properties: { foo: { type: 'string' } } } );
    });

    it( 'expands #ref', () => {
        expect( shorthand( '#foo' ) ).deep.equal( { '$ref': '#foo' } );
    });

    it( 'expands objects', () => {
        expect( shorthand( { object: { foo: {}  } } ) )
            .deep.equal( { type: 'object', properties: { foo: { } } } );
    });

    it( 'expands array', () => {
        expect( shorthand( { array: [ 'number' ] } ) )
            .deep.equal( { type: 'array', items: [ { type: 'number' } ] } );

        expect( shorthand( { array: 'number' } ) )
            .deep.equal( { type: 'array', items: { type: 'number' } } );
    });

    it( 'expands required', () => {
        expect( shorthand( { properties: { foo: { required: true } } } ) )
            .deep.equal( { required: [ 'foo' ], properties: { foo: { } } }  );
    });

    [ 'allOf', 'anyOf', 'oneOf' ].forEach( keyword =>
        it( 'recurses down ' + keyword, () => {
            let short = {};
            short[keyword] = [ 'number' ];

            let expected = {};

            expected[keyword] = [ { type: 'number' } ];

            expect( shorthand( short ) )
                .deep.equal( expected );
        })
    );

    it( 'expands definitions', () => {
        expect( shorthand( { 'definitions': {
            "foo": 'object'
        }} ) )
            .deep.equal({
                definitions: {
                    foo: { type: 'object' }
                }
        });
    });

    it( 'expands not', () => {
        expect( shorthand( { 'not': 'object' } ) )
            .deep.equal({
                not: { type: 'object' }
            });
    });


});
