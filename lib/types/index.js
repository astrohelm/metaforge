'use strict';

const prototypes = require('./proto');
const TypeStorage = require('./store');
const Builder = require('./builder');
const builder = new Builder(prototypes);

const schema = {
  type: 'object',
  properties: {
    a: 'number',
    b: { type: 'set', items: ['string'], condition: 'allof' },
    c: { type: 'object', properties: { z: 'string' } },
  },
  patternProperties: {
    '^[a-z]+': 'string',
  },
};
const expected = { a: 1, b: new Set(['a', 'b', 3]), c: { z: 'string', a: true }, hello: 'world' };
console.log(builder.build(schema)(expected, 'root'));

// const standart = ['string', 'number', 'bigint', 'boolean', 'object', 'array'];
// const types = standart.reduce((acc, t) => {
//   acc[t] = new TypeStorage(t, prototypes[t]);
//   return acc;
// }, {});

// const factory = types => {
//   for (const [type, prototype] of Object.entries(types)) {
//     if (!prototype) throw new Error('');
//     if (!prototype.test || !prototype.constructor) throw new Error('');
//   }
// };

// // scalar == ?shorthand / { type: 'string', required: true }
// // struct == { type: 'struct' ... }

// //TODO builder (just prototype initialization)
// module.exports = { prototypes, types };
