'use strict';

var _jsonSchemaShorthand = require('./json-schema-shorthand');

var _jsonSchemaShorthand2 = _interopRequireDefault(_jsonSchemaShorthand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chai = require('chai');
var expect = chai.expect;

describe('shortcuts', function () {

    it('expands string to a type', function () {

        expect((0, _jsonSchemaShorthand2.default)('string')).deep.equal({ type: 'string' });

        expect((0, _jsonSchemaShorthand2.default)({ object: { foo: 'string' } })).deep.equal({ type: 'object', properties: { foo: { type: 'string' } } });
    });
});