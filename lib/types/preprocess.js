'use strict';

const { typeOf, isShorthand } = require('./utils');
module.exports = (schema, types, tools) => {
  const tests = [];
  const path = 'PREPROCESS';

  const { warn } = tools;
  const signal = (cause, sample, sampleType) => warn({ sample, sampleType, path, cause });

  for (const type of typeOf(schema)) {
    const prototype = types[type];
    if (!prototype) {
      const err = signal('Missing prototype', prototype, type);
      tests.push(() => [err]);
      continue;
    }
    if (prototype.kind !== 'scalar' && isShorthand(schema)) {
      const err = signal('Shorthand usage with non-scalar schema', prototype, type);
      tests.push(() => [err]);
      continue;
    }

    const test = prototype.construct(schema, tools);
    tests.push(test);
  }
  return tests;
};
