'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('..');

test('Schema with errors & warnings', () => {
  const plan = {
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
  const sample = {
    a: 'test', //? +1 [Error] Type missmatch
    b: new Set(['a', 'b', 'c']), //? +1 [Warning] Shorthand non-scalar
    c: { z: 'string', a: true }, //? +1 [Error] Exotic
    hello: 'world',
    123: 'test', //? +2 [Error] Exoitic, Missing field "z"
  };
  const schema = new Schema(plan);
  assert.strictEqual(schema.warnings.length, 1);
  const { cause, message, path } = schema.warnings[0];
  assert.strictEqual(path, 'PREPROCESS');
  assert.strictEqual(cause, 'Shorthand usage with non-scalar schema');
  assert.strictEqual(message, '[PREPROCESS] => Shorthand usage with non-scalar schema');
  const errors = schema.test(sample);
  assert.strictEqual(errors.length, 4);
});

test('Schema without errors & warnings', () => {
  const plan = {
    type: 'object',
    properties: {
      a: ['number', 'string'], //? anyof
      b: { type: 'set', items: ['?string', 'any', 'unknown'], condition: 'allof' },
      c: {
        type: 'object',
        properties: {
          z: 'string',
          //? Required shorthand don't work at array items
          d: { type: 'array', items: ['?number', '?string'], condition: 'oneof' },
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
  };
  const schema = new Schema(plan);
  assert.strictEqual(schema.warnings.length, 0);
  const errors = schema.test(sample);
  assert.strictEqual(errors.length, 0);
});
