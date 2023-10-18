'use strict';

const SKIP = ['undefined', 'function', 'symbol'];
const ParseStorage = require('./store');

const createParser = store => {
  const parser = sample => {
    const type = Array.isArray(sample) ? 'array' : typeof sample;
    if (SKIP.includes(type) || (type === 'object' && !sample)) return '?unknown';
    for (const [, parse] of store[type]) {
      const result = parse(sample, parser);
      if (result) return result;
    }
    return '?unknown';
  };
  return parser;
};

module.exports = { createParser, ParseStorage };
