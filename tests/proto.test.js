'use strict';

// const schema = {
//   type: 'object',
//   properties: {
//     a: 'number',
//     b: { type: 'set', items: ['string'], condition: 'allof' },
//     c: { type: 'object', properties: { z: 'string' } },
//   },
//   patternProperties: {
//     '^[a-z]+': 'string',
//   },
// };
// const expected = { a: 1, b: new Set(['a', 'b', 3]), c: { z: 'string', a: true }, hello: 'world' };
