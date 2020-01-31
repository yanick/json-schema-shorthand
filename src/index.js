import fp from 'lodash/fp';
import u from 'updeep';

function groomRange(min, max, min_inc = true, max_inc = true) {
  return {
    [min_inc ? 'minimum' : 'exclusiveMinimum']: min,
    [max_inc ? 'maximum' : 'exclusiveMaximum']: max,
  };
}

const process_if_has = fp.curry(function(prop, update, obj) {
  return u.if(fp.has(prop), update, obj);
});

const process_nbrItems = process_if_has('nbrItems', obj => {
  const {nbrItems} = obj;
  const [minItems, maxItems] = Array.isArray(nbrItems)
    ? nbrItems
    : [nbrItems, nbrItems];

  return fp.flow([u({minItems, maxItems}), u.omit('nbrItems')])(obj);
});

const process_range = process_if_has(
  'range',
  fp.flow([obj => u(groomRange(...obj.range), obj), u.omit(['range'])]),
);

//  expand the shorthand content of `items`
const expand_items = process_if_has('items', {
  items: items =>
    Array.isArray(items) ? items.map(shorthand) : shorthand(items),
});

function groom_required_properties(obj) {
  if (!obj.hasOwnProperty('properties')) return obj;

  let required = obj.required || [];

  required = required.concat(
    Object.keys(fp.pickBy('required', obj.properties)),
  );
  required.sort();

  return u({
    required: u.if(required.length, required),
    properties: u.map(u.omit('required')),
  })(obj);
}

const process_array = process_if_has(
  'array',
  fp.flow([
    u(({array: items}) => ({
      type: 'array',
      items,
    })),
    u.omit(['array']),
  ]),
);

const process_object = process_if_has(
  'object',
  fp.flow([
    u(({object: properties}) => ({type: 'object', properties})),
    u.omit(['object']),
  ]),
);

const map_shorthand = u.if(fp.identity, u.map(shorthand));

const expand_shorthands = u({
  not: u.if(fp.identity, shorthand),
  definitions: map_shorthand,
  properties: map_shorthand,
  anyOf: map_shorthand,
  allOf: map_shorthand,
  oneOf: map_shorthand,
});

export default function shorthand(obj = {}) {
  if (typeof obj === 'string') {
    obj =
      obj[0] === '$'
        ? {$ref: obj.slice(1)}
        : obj[0] === '#'
        ? {$ref: obj}
        : {type: obj};
  }

  ['$ref', 'type'].forEach(field => {
    if (/!$/.test(obj[field])) {
      obj = u({
        required: true,
        [field]: v => v.replace(/!$/, ''),
      })(obj);
    }
  });

  return fp.flow([
    process_object,
    expand_shorthands,
    process_array,
    groom_required_properties,
    expand_items,
    process_nbrItems,
    process_range,
  ])(obj);
}

function merge_defs(...defs) {
  return shorthand(
    defs
      .map(d => (typeof d === 'string' ? {description: d} : d))
      .reduce((merged, addition) => u(addition)(merged), {}),
  );
}

const simple_def = type => (...options) => merge_defs({type}, ...options);

export const number = simple_def('number');
export const integer = simple_def('integer');
export const string = simple_def('string');

export const array = (items = null, ...options) =>
  merge_defs({type: 'array', items: u.if(items, items)}, ...options);

export const object = (properties = null, ...options) =>
  merge_defs(
    {
      type: 'object',
      properties: u.if(properties, properties),
    },
    ...options,
  );

export function add_definition(name, ...schemas) {
  this[name] = merge_defs(...schemas);
  return {$ref: '#/definitions/' + name};
}
