'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('../..');

test('[Handyman] Schema with namespace', () => {
  const namespace = { User: new Schema('string') };
  const schema = new Schema(['User', 'User'], { namespace });
  const sample = ['Alexander', 'Ivanov'];

  assert.strictEqual(namespace.User.warnings.length + schema.warnings.length, 0);
  assert.strictEqual(schema.test(sample).length, 0);
});

test('[Handyman] Pull schemas', () => {
  const schema = new Schema({
    $id: 'MySchema',
    a: 'string',
    b: { $id: 'MySubSchema', c: 'number' },
    c: new Schema('?string'),
    d: { $type: 'schema', schema: new Schema('number'), $id: 'MySubSchema2' },
    e: { $type: 'schema', schema: new Schema({ $type: 'number', $id: 'MySubSchema3' }) },
  });

  assert.strictEqual(schema.warnings.length, 0);
  assert.strictEqual(!!schema.pull('MySchema'), false);
  assert.strictEqual(!!schema.pull('MySubSchema'), true);
  assert.strictEqual(!!schema.pull('MySubSchema2'), true);
  assert.strictEqual(!!schema.pull('MySubSchema3'), true);
});

test('[Handyman] Shorthands', () => {
  const schema = new Schema(
    {
      a: 'string', //? scalar shorthand
      b: '?string', //? optional shorthand
      c: ['string', 'string'], //? tuple
      d: new Schema('?string'), //? Schema shorthand
      e: ['winter', 'spring'], //? Enum shorthand
      f: { a: 'number', b: 'string' }, //? Object shorthand
      g: { $type: 'array', items: 'string' }, //? Array items shorthand
      h: 'MyExternalSchema',
    },
    { namespace: { MyExternalSchema: new Schema('string') } },
  );

  assert.strictEqual(schema.warnings.length, 0);
});
