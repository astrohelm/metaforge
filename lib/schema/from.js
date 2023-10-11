'use strict';

const { utils } = require('astropack');
const scalars = Object.keys(require('../proto/scalars'));
const skip = [...scalars, 'undefined', 'function', 'symbol'];

const schemaFrom = sample => {
  const type = typeof sample;
  if (skip.includes(type)) return type;
  if (type === 'object' && !sample) return 'unknown';
  if (type === 'object' && Array.isArray(sample)) {
    const items = sample.reduce((acc, sample) => {
      const schema = schemaFrom(sample);
      for (const saved of acc) if (utils.equals(saved, schema)) return acc;
      return acc.push(schema), acc;
    }, []);
    if (items.length === 0) return { type: 'array', items: ['unknown'] };
    if (items.length === 1) return { type: 'array', items: [items[0]] };
    return { type: 'array', items };
  }

  const properties = Object.entries(sample).reduce((acc, [key, prop]) => {
    acc[key] = schemaFrom(prop);
    return acc;
  }, {});

  return { type: 'object', properties };
};

module.exports = schemaFrom;
