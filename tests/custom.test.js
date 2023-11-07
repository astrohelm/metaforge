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

test('Custom modules', () => {
  let counter = 0;
  const plugin = () => counter++;
  Schema.modules.set('first', plugin);
  new Schema().register('second', plugin);
  assert.strictEqual(counter, 2);
});

test('Example test', () => {
  const userSchema = new Schema({
    $id: 'userSchema',
    $meta: { name: 'user', description: 'schema for users testing' },
    phone: { $type: 'union', types: ['number', 'string'] }, //? number or string
    name: { $type: 'set', items: ['string', '?string'] }, //? set tuple
    phrase: (_, parent) => 'Hello ' + [...parent.name].join(' ') + ' !',
    mask: { $type: 'array', items: 'string' }, //? array
    ip: {
      $type: 'array',
      $required: false,
      $rules: [ip => ip[0] === '192'], //? custom rules
      items: { $type: 'union', types: ['string', '?number'], condition: 'oneof', $required: false },
    },
    type: ['elite', 'member', 'guest'], //? enum
    '[a-z]+Id': { $type: '?number', isPattern: true }, // pattern fields
    address: 'string',
    secondAddress: '?string',
    options: { notifications: 'boolean', lvls: ['number', 'string'] },
  });

  const systemSchema = new Schema({ $type: 'array', items: userSchema });

  const sample = [
    {
      myId: 1,
      phone: '7(***)...',
      ip: ['192', 168, '1', null],
      type: 'elite',
      mask: ['255', '255', '255', '0'],
      name: new Set(['Alexander', null]),
      options: { notifications: true, lvls: [2, '["admin", "user"]'] },
      address: 'Pushkin street',
    },
    //...
  ];

  assert.strictEqual(systemSchema.warnings.length, 0);
  systemSchema.calculate(sample);
  assert.strictEqual(typeof sample[0].phrase, 'string');
  assert.strictEqual(systemSchema.test(sample).valid, true);
  assert.strictEqual(!!systemSchema.pull('userSchema'), true);
  assert.strictEqual(systemSchema.pull('userSchema').test(sample[0]).valid, true);
  assert.strictEqual(
    systemSchema.pull('userSchema').test({ phone: 123 }, 'root', true).valid,
    true,
  );
});
