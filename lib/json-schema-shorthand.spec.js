import shorthand from './json-schema-shorthand';
const chai = require('chai');
const expect = chai.expect;

describe( 'shortcuts', () => {

    it( 'expands string to a type', () => {

        expect( shorthand( 'string') ).deep.equal( { type: 'string' } );

        expect( shorthand( { object: { foo: 'string' } } ) )
            .deep.equal( { type: 'object', properties: { foo: { type: 'string' } } } );
    });

});
