'use strict';

const path = 'PREPROCESS';
const { string } = require('astropack');
const { typeOf, isShorthand } = require('./utils');

module.exports = ({ types, namespace }, tools, schema) => {
  const [tests, { warn }] = [[], tools];
  const signal = (cause, sample, sampleType) => warn({ sample, sampleType, path, cause });
  for (const type of typeOf(schema)) {
    if (string.case.isFirstUpper(type)) {
      const prototype = namespace[type];
      if (prototype) {
        tests.push(prototype.test);
        continue;
      }
    }
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
    tests.push(prototype.construct(schema, tools));
  }
  return tests;
};
