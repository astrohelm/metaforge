'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('..');

test('Schema with namespace', () => {
  const plan = {
    type: 'object',
    allowExotic: true,
    properties: {
      a: ['number', 'string'], //? anyof
      b: { type: 'set', items: ['?string', 'any', 'unknown'], condition: 'allof' },
      c: {
        type: 'object',
        properties: {
          z: 'string',
          //? Required shorthand don't work at array items
          d: { type: 'array', items: ['?string', '?number'], condition: 'oneof' },
        },
      },
      z: 'string',
      z2: '?string', //? not required
      z3: { type: 'string', required: false },
    },
    patternProperties: {
      '^[a-z]+': 'string',
    },
  };
  const sample = {
    a: 'test',
    b: new Set(['a', 'b', 'c']),
    c: { z: 'string', d: [1, 'test'] },
    hello: 'world',
    z: 'test',
    123: 'test',
  };
  const schemaA = new Schema(plan);
  const namespace = new Map();
  namespace.set('IntegratedSchema', schemaA);
  const schemaB = new Schema({ type: 'IntegratedSchema' }, { namespace });
  assert.strictEqual(schemaB.warnings.length + schemaB.warnings.length, 0);
  const errors = schemaB.test(sample);
  assert.strictEqual(errors.length, 0);
});
