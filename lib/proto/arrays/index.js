'use strict';

const astropack = require('astropack');
const struct = require('./struct');

const parse = (sample, parse) => {
  if (!Array.isArray(sample)) return null;
  const items = sample.reduce((acc, sample) => {
    const plan = parse(sample);
    for (const saved of acc) if (astropack.utils.equals(saved, plan)) return acc;
    return acc.push(plan), acc;
  }, []);
  if (items.length === 0) return { type: 'array', items: ['unknown'] };
  if (items.length === 1) return { type: 'array', items: [items[0]] };
  return { type: 'array', items };
};

module.exports = {
  array: struct(value => Array.isArray(value)),
  set: struct(value => value?.constructor?.name === 'Set'),
};
module.exports.array.parse = Object.assign(parse, { targets: ['object'] });
