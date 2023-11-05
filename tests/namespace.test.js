'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('..');

test('Schema with namespace', () => {
  const namespace = { User: new Schema('string') };
  const schema = new Schema(['User', 'User'], { namespace });
  const sample = ['Alexander', 'Ivanov'];

  assert.strictEqual(namespace.User.warnings.length + schema.warnings.length, 0);
  assert.strictEqual(schema.test(sample).length, 0);
});
