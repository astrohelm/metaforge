'use strict';

const createParsers = require('./parsers');

module.exports = root => {
  const parsers = createParsers(root);
  return source => {
    const type = Array.isArray(source) ? 'array' : typeof source;
    const parser = parsers[type];
    if (parser) {
      for (const method of parser) {
        const result = method(source);
        if (result) return result;
      }
    }
    throw new Error(`Invalid definition: "${source}" of type ${type}`);
  };
};
