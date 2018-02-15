import _ from 'lodash';
import u from 'updeep';

function groomRange(min,max,min_inc=true,max_inc=true) { 
    return {
        [ min_inc ? 'minimum' : 'exclusiveMinimum' ] : min,
        [ max_inc ? 'maximum' : 'exclusiveMaximum' ] : max,
    };
}

const process_if_has = prop => f => obj =>
    obj.hasOwnProperty(prop) ? f(obj) : obj;

const process_nbrItems = process_if_has('nbrItems')( obj => {
    let nbrItems = obj.nbrItems;
    let is_array = Array.isArray(nbrItems);

    return u({
        minItems: is_array ? nbrItems[0] : nbrItems,
        maxItems: is_array ? nbrItems[1] : nbrItems,
    }, u.omit('nbrItems')(obj) );
});

const process_range = process_if_has( 'range' )( obj =>
    u.omit( 'range', u( groomRange( ...(obj.range) ), obj ) )
);

//  expand the shorthand content of `items`
const expand_items = u({
    items: u.if( _.identity, 
        items => Array.isArray(items) ? items.map( shorthand ) : shorthand(items)
    )
});

function groom_required_properties(obj) {
    if( !obj.hasOwnProperty('properties') ) return obj;

    let required = obj.required || [];

    required = required.concat(
        _.keys( _.pickBy( obj.properties, 'required' ) )
    );
    required.sort();

    return u({ 
        required:   u.if( required.length, required ),
        properties: u.map( u.omit( 'required' ) )
    })(obj);
}

const process_array = obj => u.if( obj.array,
    { type: 'array', items: obj.array }
)( u.omit( 'array', obj ) );

const map_shorthand = u.if( _.identity, u.map(shorthand) );

const expand_shorthands = u({
    not:         u.if( _.identity, shorthand ),
    definitions: map_shorthand,
    properties:  map_shorthand,
    anyOf:       map_shorthand,
    allOf:       map_shorthand,
    oneOf:       map_shorthand,
});

export default
function shorthand(obj={}) {
    if( typeof obj === 'string' ) {
        obj = obj[0] === '$' ? { '$ref': obj.slice(1) }
            : obj[0] === '#' ? { '$ref': obj }
            :                  { type: obj }
    }

    [ '$ref', 'type' ].forEach( field => {
        if( /!$/.test( obj[field] ) ) {
            obj = u({
                required: true,
                [field]: v => v.replace( /!$/, '' )
            })(obj);
        }
    });

    obj = u.omit( 'object' )( 
        u.if( obj.hasOwnProperty('object'), {
            type: 'object',
            properties: obj.object,
        })(obj));

    obj = _.flow([ 
        expand_shorthands,
        process_array,
        groom_required_properties,
        expand_items,
        process_nbrItems,
        process_range,
    ])( obj );

    return obj;
}

function merge_defs( ...defs ) {
    return shorthand( 
        defs.map( d => typeof d === 'string' ? { description: d } : d )
            .reduce( ( merged, addition ) => u(addition)(merged), {} )
    );
}

const simple_def = type => (...options) => merge_defs({ type }, ...options);

export const number  = simple_def('number');
export const integer = simple_def('integer');
export const string  = simple_def('string');

export const array  = (items=null,...options) => merge_defs(
    { type: 'array', items: u.if(items,items), }, ...options
);

export const object = (properties=null,...options) => merge_defs(
    { 
        type: "object", 
        properties: u.if(properties,properties),
    }, ...options
);


export function add_definition( name, ...schemas ) {
    this[ name ] = merge_defs(...schemas);
    return { '$ref': '#/definitions/' + name }
}
