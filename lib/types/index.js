'use strict';

const prototypes = require('./proto');
const TypeStorage = require('./store/store');
const Builder = require('./builder');

const standart = ['string', 'number', 'bigint', 'boolean', 'object', 'array'];
const parseStorage = standart.reduce((acc, t) => {
  acc[t] = new TypeStorage(t, prototypes[t]);
  return acc;
}, {});

const schema = {
  type: 'object',
  properties: {
    a: ['number'],
    b: { type: 'set', items: ['array'], condition: 'anyof' },
    c: { type: 'object', properties: { z: 'string' } },
    z: 'string',
    z2: '?string',
  },
  patternProperties: {
    '^[a-z]+': 'string',
  },
};
const expected = {
  a: 'test',
  b: new Set(['a', 'b', 'c']),
  c: { z: 'string', a: true },
  hello: 'world',
};
const builder = new Builder(prototypes);
const test = builder.build(schema);
console.log(test(expected));

// const factory = types => {
//   for (const [type, prototype] of Object.entries(types)) {
//     if (!prototype) throw new Error('');
//     if (!prototype.test || !prototype.constructor) throw new Error('');
//   }
// };

// module.exports = { Builder, prototypes, factory, parseStorage };
