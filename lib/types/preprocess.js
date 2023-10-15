'use strict';

const { typeOf, isShorthand } = require('./utils');
module.exports = (schema, types, builder) => {
  const [tests, warnings] = [[], []];
  const { Error } = builder;

  for (const type of typeOf(schema)) {
    const prototype = types[type];
    if (!prototype) {
      const cause = 'Missing prototype';
      const err = new Error({ path: 'BUILD', cause, sample: prototype, sampleType: type });
      warnings.push(err);
      tests.push(() => [err]);
      continue;
    }
    if (prototype.kind !== 'scalar' && isShorthand(schema)) {
      const cause = 'Shorthand usage with non-scalar schema';
      const err = new Error({ path: 'BUILD', cause, sample: prototype, sampleType: type });
      warnings.push(err);
      tests.push(() => [err]);
      continue;
    }
    const test = prototype.build(schema, builder);
    tests.push(test);
  }
  return { tests, warnings };
};
