'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Schema = require('..');

test('Generate schema from sample', () => {
  const sample = {
    lines: ['Pushkin streen', 'Kalatushkin home', 8],
    zip: '123103',
    city: 'Moscow',
    country: 'Russia',
  };
  const expected = {
    type: 'object',
    properties: {
      lines: { type: 'array', items: ['string', 'number'] },
      zip: 'string',
      city: 'string',
      country: 'string',
    },
  };
  const plan = Schema.parse(sample);
  assert.deepStrictEqual(plan, expected);
});

test('Generate schema from array of objects', () => {
  const sample = [
    {
      country: 'Russia',
      lines: ['Pushkin street', 'Kalatushkin home', 8],
      zip: '123103',
      city: 'Moscow',
    },
    {
      lines: ['Ivanov street', 25],
      city: 'Moscow',
      zip: '123103',
      country: 'Russia',
    },
    {
      lines: ['Brodway street'],
      zip: '123103',
      city: 'New York',
      phone: '+1 111...',
      country: 'USA',
    },
  ];
  const expected = {
    type: 'array',
    items: [
      {
        type: 'object',
        properties: {
          lines: { type: 'array', items: ['string', 'number'] },
          zip: 'string',
          city: 'string',
          country: 'string',
        },
      },
      {
        type: 'object',
        properties: {
          lines: { type: 'array', items: ['string'] },
          zip: 'string',
          city: 'string',
          phone: 'string',
          country: 'string',
        },
      },
    ],
  };
  const plan = Schema.parse(sample);
  assert.deepStrictEqual(plan, expected);
});
