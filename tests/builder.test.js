'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const { Schema, prototypes } = require('../lib');

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
  const plan = new Schema(schema, { types: prototypes });
  assert.strictEqual(plan.warnings.length, 1);
  const { cause, message, path } = plan.warnings[0];
  assert.strictEqual(path, 'PREPROCESS');
  assert.strictEqual(cause, 'Shorthand usage with non-scalar schema');
  assert.strictEqual(message, '[PREPROCESS] => Shorthand usage with non-scalar schema');
  const errors = plan.test(sample);
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
  const plan = new Schema(schema, { types: prototypes });
  assert.strictEqual(plan.warnings.length, 0);
  const errors = plan.test(sample);
  assert.strictEqual(errors.length, 0);
});

test('Schema with namespace', () => {
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
  const PlanA = new Schema(schema, { types: prototypes });
  const PlanB = new Schema({ type: 'PlanA' }, { types: prototypes, namespace: { PlanA } });
  assert.strictEqual(PlanB.warnings.length + PlanA.warnings.length, 0);
  const errors = PlanB.test(sample);
  assert.strictEqual(errors.length, 0);
});
