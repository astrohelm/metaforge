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
  assert.strictEqual(schema.test('Hello world').length, 0);
});

test('String type of rules', () => {
  const lengthRule = sample => sample?.length > 5 && sample?.length < 100;
  const mailRule = sample => sample?.includes('@');
  const isGmail = sample => sample?.includes('gmail.com');
  const rules = new Map().set('length', lengthRule).set('mail', mailRule);
  const plan = { type: 'string', rules: ['length', 'mail', isGmail], required: false };
  const schema = new Schema(plan, { rules });
  assert.strictEqual(schema.warnings.length, 0);
  assert.strictEqual(schema.test().length, 0);
  console.log(schema.test('Alexander Ivanov'));
  assert.strictEqual(schema.test('Alexander Ivanov').length, 2); //? Not a mail
  assert.strictEqual(schema.test('somemail@gmail.com').length, 0);
});
