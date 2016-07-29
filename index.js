import _ from 'lodash';

function sh_json_schema(obj) {
    if( typeof obj === 'string' ) {
        return obj[0] === '#' ? { '$ref': obj } : { type: obj };
    }

    if( obj.hasOwnProperty('object') ) {
        obj.type = 'object';
        obj.properties = obj.object;
        delete obj.object;
    }

    if( obj.hasOwnProperty('definitions') ) {
        obj.definitions = _.mapValues(obj.definitions, 
                v => sh_json_schema(v)
        );
    }

    if( obj.hasOwnProperty('array') ) {
        obj.type = 'array';
        obj.items = sh_json_schema( obj.array );
        delete obj.array;
    }

    if( obj.hasOwnProperty('properties') ) {
        obj.properties = _.mapValues(obj.properties,
                v => sh_json_schema(v) );
    }

    if( obj.hasOwnProperty('properties') ) {
        let required = obj.required || [];
        required = required.concat(
            _.keys( obj.properties ).filter(
                k => obj.properties[k].required
            )
        );

        obj.properties = _.mapValues(
            obj.properties,
            v => _.omit( v, 'required' )
        );

        if( required.length > 0 ) {
            obj.required = required;
        }
    }


    return obj;
}

export default
function shorthand_json(schema) {

    return sh_json_schema(schema);
}

