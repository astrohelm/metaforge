'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('../..');

test('[Metacalc], calculated fields', () => {
  const schema = new Schema({
    $id: 'user',
    name: 'string',
    phrase: { $type: 'string', default: schema => 'Hello ' + schema.name + ' !' },
  });

  console.log(schema.calc({ name: 'Alexander' }));
});
