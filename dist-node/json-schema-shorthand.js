'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.object = exports.array = exports.string = exports.integer = exports.number = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = shorthand;
exports.add_definition = add_definition;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function groomRange(min, max) {
    var _ref;

    var min_inc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var max_inc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    return _ref = {}, _defineProperty(_ref, min_inc ? 'minimum' : 'exclusiveMinimum', min), _defineProperty(_ref, max_inc ? 'maximum' : 'exclusiveMaximum', max), _ref;
}

var process_if_has = function process_if_has(prop) {
    return function (f) {
        return function (obj) {
            return obj.hasOwnProperty(prop) ? f(obj) : obj;
        };
    };
};

var process_nbrItems = process_if_has('nbrItems')(function (obj) {
    var nbrItems = obj.nbrItems;
    var is_array = Array.isArray(nbrItems);

    return (0, _updeep2.default)({
        minItems: is_array ? nbrItems[0] : nbrItems,
        maxItems: is_array ? nbrItems[1] : nbrItems
    }, _updeep2.default.omit('nbrItems')(obj));
});

var process_range = process_if_has('range')(function (obj) {
    return _updeep2.default.omit('range', (0, _updeep2.default)(groomRange.apply(undefined, _toConsumableArray(obj.range)), obj));
});

//  expand the shorthand content of `items`
var expand_items = (0, _updeep2.default)({
    items: _updeep2.default.if(_lodash2.default.identity, function (items) {
        return Array.isArray(items) ? items.map(shorthand) : shorthand(items);
    })
});

function groom_required_properties(obj) {
    if (!obj.hasOwnProperty('properties')) return obj;

    var required = obj.required || [];

    required = required.concat(_lodash2.default.keys(_lodash2.default.pickBy(obj.properties, 'required')));
    required.sort();

    return (0, _updeep2.default)({
        required: _updeep2.default.if(required.length, required),
        properties: _updeep2.default.map(_updeep2.default.omit('required'))
    })(obj);
}

var process_array = function process_array(obj) {
    return _updeep2.default.if(obj.array, { type: 'array', items: obj.array })(_updeep2.default.omit('array', obj));
};

var map_shorthand = _updeep2.default.if(_lodash2.default.identity, _updeep2.default.map(shorthand));

var expand_shorthands = (0, _updeep2.default)({
    not: _updeep2.default.if(_lodash2.default.identity, shorthand),
    definitions: map_shorthand,
    properties: map_shorthand,
    anyOf: map_shorthand,
    allOf: map_shorthand,
    oneOf: map_shorthand
});

function shorthand() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (typeof obj === 'string') {
        obj = obj[0] === '$' ? { '$ref': obj.slice(1) } : obj[0] === '#' ? { '$ref': obj } : { type: obj };
    }

    ['$ref', 'type'].forEach(function (field) {
        if (/!$/.test(obj[field])) {
            obj = (0, _updeep2.default)(_defineProperty({
                required: true
            }, field, function (v) {
                return v.replace(/!$/, '');
            }))(obj);
        }
    });

    obj = _updeep2.default.omit('object')(_updeep2.default.if(obj.hasOwnProperty('object'), {
        type: 'object',
        properties: obj.object
    })(obj));

    obj = _lodash2.default.flow([expand_shorthands, process_array, groom_required_properties, expand_items, process_nbrItems, process_range])(obj);

    return obj;
}

var number = exports.number = function number(options) {
    return shorthand(_extends({ type: 'number' }, options));
};
var integer = exports.integer = function integer(options) {
    return shorthand(_extends({ type: 'integer' }, options));
};
var string = exports.string = function string(options) {
    return shorthand(_extends({ type: 'string' }, options));
};

var array = exports.array = function array(items) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return shorthand((0, _updeep2.default)({
        type: 'array',
        items: _updeep2.default.if(items, items)
    })(options));
};

var object = exports.object = function object(properties) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return shorthand((0, _updeep2.default)({
        type: 'object',
        properties: _updeep2.default.if(properties, properties)
    })(options));
};

function add_definition(name, schema) {
    this[name] = shorthand(schema);
    return { '$ref': '#/definitions/' + name };
}