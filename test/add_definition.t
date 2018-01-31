import tap from 'tap';

import { 
    shorthand,
    add_definition,
    object,
    array,
    number, integer, string 
} from '../src/json-schema-shorthand';

tap.test( 'with ::', t => {

    let defs = {};

    let foo = defs::add_definition( 'foo', 'number' );

    t.same( defs, { foo: { type: 'number' } }, "defs updated" );
    t.same( foo, { '$ref': '#/definitions/foo'  }, "foo is a schema ref" );

    t.end();
});

tap.test( 'with .bind()', t => {

    let defs = {};
    const add_def = add_definition.bind(defs);

    let foo = add_def( 'foo', 'number' );

    t.same( defs, { foo: { type: 'number' } }, "defs updated" );
    t.same( foo, { '$ref': '#/definitions/foo'  }, "foo is a schema ref" );

    t.end();
});
