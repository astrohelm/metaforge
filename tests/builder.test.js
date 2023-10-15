'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const { Builder, prototypes } = require('../lib/types');
const builder = new Builder(prototypes);

test('Builder constructor', () => {
  assert.strictEqual(typeof builder, 'object');
  assert.strictEqual(typeof builder.build, 'function');
  assert.strictEqual(typeof builder.typeOf, 'function');
  assert.strictEqual(typeof builder.isShorthand, 'function');
  assert.strictEqual(typeof builder.isRequired, 'function');
  assert.strictEqual(typeof builder.conditions, 'function');
  assert.strictEqual(typeof builder.builders, 'object');
  assert.strictEqual(typeof builder.builders.array, 'function');
  assert.strictEqual(typeof builder.builders.object, 'function');
  assert.strictEqual(typeof builder.Error, 'function');
});

test('Builder error', () => {
  const { Error } = builder;
  const err = new Error({ path: 'Test', schema: {}, cause: 'Test', sampleType: 'string' });
  assert.strictEqual(typeof err, 'object');
  assert.strictEqual(JSON.stringify(err), '{"path":"Test","cause":"Test","count":1}');
  assert.strictEqual('' + err, `[Test] => Test`);
  assert.strictEqual(typeof err.add, 'function');
  assert.strictEqual('' + err.add('New').add('Test'), `[Test] => Test, New, Test`);
});

test('Schema with errors & warnings', () => {
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
  const sample = {
    a: 'test', //? +1 Type missmatch
    b: new Set(['a', 'b', 'c']), //? +3 Shorthand non-scalar
    c: { z: 'string', a: true }, //? +1 Exotic
    hello: 'world',
    123: 'test', //? +2 Exoitic,  Missing field "z"
  };
  const test = builder.build(schema);
  assert.strictEqual(test.warnings.length, 1);
  const { cause, message, path } = test.warnings[0];
  assert.strictEqual(path, 'PREPROCESS');
  assert.strictEqual(cause, 'Shorthand usage with non-scalar schema');
  assert.strictEqual(message, '[PREPROCESS] => Shorthand usage with non-scalar schema');
  const errors = test(sample);
  assert.strictEqual(errors.length, 7);
});

test('Schema without errors & warnings', () => {
  const schema = {
    type: 'object',
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
  };
  const test = builder.build(schema);
  assert.strictEqual(test.warnings.length, 0);
  const errors = test(sample);
  assert.strictEqual(errors.length, 0);
});
