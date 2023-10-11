'use strict';

const test = require('node:test');
const assert = require('node:assert');
const schema = require('../lib/schema');

test('Generate schema from sample', () => {
  const sample = {
    lines: ['Pushkin streen', 'Kalatushkin home', 8],
    zip: '123103',
    city: 'Moscow',
    country: 'Russia',
  };
  const expected = {
    type: 'object',
    properties: {
      lines: { type: 'array', items: ['string', 'number'] },
      zip: 'string',
      city: 'string',
      country: 'string',
    },
  };
  const plan = schema.from(sample);
  console.dir(plan, { depth: 4 });
  assert.deepStrictEqual(plan, expected);
});
