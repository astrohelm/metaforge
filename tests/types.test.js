'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('..');

test('Custom types', () => {
  const types = new Map();

  const datePrototype = {
    meta: { kind: 'scalar', type: 'date' },
    construct(plan, { isRequired, Error }) {
      this.required = isRequired(plan);
      this.test = (sample, path) => {
        if (!this.required && sample === undefined) return [];
        if (this.required && !sample) {
          return [new Error({ plan, sample, path, cause: 'Value is required' })];
        }
        if (typeof sample !== 'object' && typeof sample !== 'string') {
          return [new Error({ plan, sample, path, cause: 'Invalid sample type' })];
        }
        if (isNaN(new Date(sample))) {
          return [new Error({ plan, sample, path, cause: 'Invalid sample type' })];
        }
        return [];
      };
    },
  };
  types.set('myDate', datePrototype);
  const plan = '?myDate';
  const schema = new Schema(plan, { types });
  assert.strictEqual(schema.warnings.length, 0);
  assert.strictEqual(schema.test().length, 0);
  assert.strictEqual(schema.test(new Date()).length, 0);
  assert.strictEqual(schema.test(new Date('Invalid param')).length, 1);
});

test('Custom types with meta replacement for old ones', () => {
  const types = new Map();
  types.set('string', { meta: { newMeta: 'This String is awsome' } });
  types.set('number', { meta: { newMeta: 'This Number is awsome' } });
  const stringSchema = new Schema('string', { types });
  const numberSchema = new Schema('number', { types });
  assert.strictEqual(stringSchema.warnings.length + numberSchema.warnings.length, 0);
  assert.strictEqual(numberSchema.test(1).length, 0);
  assert.strictEqual(stringSchema.test('test').length, 0);
  assert.strictEqual(stringSchema.newMeta, 'This String is awsome');
  assert.strictEqual(numberSchema.newMeta, 'This Number is awsome');
});
