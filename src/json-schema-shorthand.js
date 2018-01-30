import _ from 'lodash';
import u from 'updeep';

function groomRange(min,max,min_inc=true,max_inc=true) { 
    let props = {};
    props[ min_inc ? 'minimum' : 'exclusiveMinimum' ] = min;
    props[ max_inc ? 'maximum' : 'exclusiveMaximum' ] = max;
    return props;
}

function process_nbrItems(obj) {
    let nbrItems = obj.nbrItems;

    return u.omit( 'nbrItems' )(
        u({
            minItems: Array.isArray(nbrItems) ? nbrItems[0] : nbrItems,
            maxItems: Array.isArray(nbrItems) ? nbrItems[1] : nbrItems,
        })(obj)
    );
}

function process_range(obj) {
    return u.omit( 'range' )( 
        u( groomRange( ...(obj.range) )  )( obj )
    );
}

const transformations = [
    { keyword: 'nbrItems', processor: process_nbrItems },
    { keyword: 'range',    processor: process_range    },
];

function procress_transformations(obj) {
    return transformations.reduce( (obj,t) => 
        obj.hasOwnProperty(t.keyword) ? t.processor(obj) : obj
    , obj );
}



export default
function sh_json_schema(obj={}) {
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

    obj = u.if( obj.hasOwnProperty('definitions'), {
        definitions: u.map( sh_json_schema )
    })(obj);

    obj = u( _.fromPairs( 
        [ 'anyOf', 'allOf', 'oneOf' ].map( k => 
            [ k, u.if( _.identity, u.map(sh_json_schema) ) ] 
        )
    ))(obj);

    obj = u.if( o => o.not, { not: sh_json_schema }, obj );

    if( obj.hasOwnProperty('array') ) {
        obj = u.omit( 'array', u( { type: 'array', items: obj.array }, obj ) );
    }

    obj = u.if( o => o.properties, { properties: u.map( sh_json_schema ) } )( obj );

    if( obj.hasOwnProperty('properties') ) {
        let required = obj.required || [];
        required = required.concat(
            _.keys( obj.properties ).filter(
                k => obj.properties[k].required
            )
        );

        obj = u({ properties: u.map( u.omit( 'required' ) ) })(obj);

        required.sort();
        obj = u.if(required.length, { required })(obj);
    }

    obj = u.if( o => o.items, {
        items: items => Array.isArray(items) ? items.map( sh_json_schema ) : sh_json_schema(items)
    } )(obj);

    obj = procress_transformations(obj);

    return obj;
}
