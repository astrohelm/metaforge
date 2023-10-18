'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('..');

test('Rules', () => {
  const rule1 = sample => sample?.length > 5;
  const rule2 = sample => sample?.length < 100;
  const plan = { type: 'string', rules: [rule1, rule2] };
  const schema = new Schema(plan);
  assert.strictEqual(schema.warnings.length, 0);
  assert.strictEqual(schema.test().length, 3); //? Required + two rules
  assert.strictEqual(schema.test('Test').length, 1); //? One rule
  console.log(schema.test('Hello world'));
  assert.strictEqual(schema.test('Hello world').length, 0);
});
