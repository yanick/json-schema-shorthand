import { 
    object,
    array,
    number, integer, string 
} from './index';

const same = ( received, expected, desc ) => {
    if(!desc) desc = JSON.stringify(received);

    test( desc, () => expect(received).toEqual(expected) );
};

describe( 'number',  () => {
    same(
        number(),
        { type: 'number' },
        'no argument'
    );

    same(
        number({ minimum: 3 }),
        { type: 'number', minimum: 3 },
        'arguments'
    );

    same(
        number({ range: [3,5] }),
        { type: 'number', minimum: 3, maximum: 5 },
        'shorthand arguments'
    );

});

describe( 'string',  () => {
    same(
        string(),
        { type: 'string' },
        'no argument'
    );

    same(
        string({ minimum: 3 }),
        { type: 'string', minimum: 3 },
        'arguments'
    );

    same(
        string({ range: [3,5] }),
        { type: 'string', minimum: 3, maximum: 5 },
        'shorthand arguments'
    );

});

describe( 'integer',  () => {
    same(
        integer(),
        { type: 'integer' },
        'no argument'
    );

    same(
        integer({ minimum: 3 }),
        { type: 'integer', minimum: 3 },
        'arguments'
    );

    same(
        integer({ range: [3,5] }),
        { type: 'integer', minimum: 3, maximum: 5 },
        'shorthand arguments'
    );

});

describe( 'array',  () => {
    same(
        array(),
        { type: 'array' },
        'no argument'
    );

    same(
        array('string'),
        { type: 'array', items: { type: 'string' } },
        'w/ items'
    );

    same(
        array('string', { minItems: 3 }),
        { type: 'array', items: { type: 'string' }, minItems: 3 },
        'w/ items and options'
    );


});

describe( 'object',  () => {
    same(
        object(),
        { type: 'object' },
        'no argument'
    );

    same(
        object({ foo: 'string' }),
        { type: 'object', properties: { foo: { type: 'string' } } },
        'w/ properties'
    );

    same(
        object({ foo: 'string' }, { maxProperties: 3 }),
        { type: 'object', properties: { foo: { type: 'string' } }, maxProperties: 3 },
        'w/ props and options'
    );


});

describe( 'with description',  () => {

    test( 'turn the string into desc', () => {
        expect(object( null, "foo", { additionalProperties: true } ))
            .toMatchObject( { description: "foo", additionalProperties: true });
    });

});
