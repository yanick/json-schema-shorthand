'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = shorthand_json;
var _ = require('lodash');

function sh_json_schema(obj) {
    if (typeof obj === 'string') {
        obj = obj[0] === '#' ? { '$ref': obj } : { type: obj };
    }

    ['$ref', 'type'].forEach(function (field) {
        if (/!$/.test(obj[field])) {
            obj.required = true;
            obj[field] = obj[field].replace(/!$/, '');
        }
    });

    if (obj.hasOwnProperty('object')) {
        obj.type = 'object';
        obj.properties = obj.object;
        delete obj.object;
    }

    ['definitions'].filter(function (k) {
        return obj.hasOwnProperty(k);
    }).forEach(function (keyword) {
        obj[keyword] = _.mapValues(obj[keyword], function (v) {
            return sh_json_schema(v);
        });
    });

    ['anyOf', 'allOf', 'oneOf'].filter(function (k) {
        return obj.hasOwnProperty(k);
    }).forEach(function (keyword) {
        obj[keyword] = obj[keyword].map(function (v) {
            return sh_json_schema(v);
        });
    });

    ['not'].filter(function (k) {
        return obj.hasOwnProperty(k);
    }).forEach(function (keyword) {
        obj[keyword] = sh_json_schema(obj[keyword]);
    });

    if (obj.hasOwnProperty('array')) {
        obj.type = 'array';
        obj.items = Array.isArray(obj.array) ? obj.array.map(sh_json_schema) : sh_json_schema(obj.array);
        delete obj.array;
    }

    if (obj.hasOwnProperty('properties')) {
        obj.properties = _.mapValues(obj.properties, function (v) {
            return sh_json_schema(v);
        });
    }

    if (obj.hasOwnProperty('properties')) {
        var required = obj.required || [];
        required = required.concat(_.keys(obj.properties).filter(function (k) {
            return obj.properties[k].required;
        }));

        obj.properties = _.mapValues(obj.properties, function (v) {
            return _.omit(v, 'required');
        });

        if (required.length > 0) {
            required.sort();
            obj.required = required;
        }
    }

    return obj;
}

function shorthand_json(schema) {
    return sh_json_schema(schema);
}