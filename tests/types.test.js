'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('..');

test('Custom prototypes', () => {
  function MyDate() {
    this.$kind = 'scalar';
    this.test = sample => {
      if (!isNaN(new Date(sample))) return null;
      return 'Invalid sample type';
    };
  }

  const schema = new Schema('?date', { prototypes: { date: MyDate } });
  assert.strictEqual(schema.warnings.length, 0);
  assert.strictEqual(schema.test().length, 0);
  assert.strictEqual(schema.test(new Date()).length, 0);
  assert.strictEqual(schema.test(new Date('Invalid param')).length, 1);
});

test('Custom prototypes with meta replacement for old ones', () => {
  const prototypes = new Map();
  prototypes.set('string', { about: 'This String is awsome' });
  prototypes.set('number', { about: 'This Number is awsome' });
  const prototypeOnject = Object.fromEntries(prototypes.entries());
  const stringSchema = new Schema('string', { prototypes });
  const numberSchema = new Schema(
    { $type: 'number', $meta: { desc: 'age' } },
    { prototypes: prototypeOnject },
  );
  assert.strictEqual(stringSchema.warnings.length + numberSchema.warnings.length, 0);
  assert.strictEqual(numberSchema.test(1).length, 0);
  assert.strictEqual(stringSchema.test('test').length, 0);
  assert.strictEqual(stringSchema.about, 'This String is awsome');
  assert.strictEqual(numberSchema.about, 'This Number is awsome');
  assert.strictEqual(numberSchema.desc, 'age');
});
