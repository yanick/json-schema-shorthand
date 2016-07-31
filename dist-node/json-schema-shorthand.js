'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = shorthand_json;
var _ = require('lodash');

function sh_json_schema(obj) {
    if (typeof obj === 'string') {
        return obj[0] === '#' ? { '$ref': obj } : { type: obj };
    }

    if (obj.hasOwnProperty('object')) {
        obj.type = 'object';
        obj.properties = obj.object;
        delete obj.object;
    }

    if (obj.hasOwnProperty('definitions')) {
        obj.definitions = _.mapValues(obj.definitions, function (v) {
            return sh_json_schema(v);
        });
    }

    if (obj.hasOwnProperty('array')) {
        obj.type = 'array';
        obj.items = sh_json_schema(obj.array);
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
            obj.required = required;
        }
    }

    return obj;
}

function shorthand_json(schema) {
    return sh_json_schema(schema);
}