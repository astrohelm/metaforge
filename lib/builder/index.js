'use strict';

const preprocess = require('./preprocess');
module.exports = (types, tools, plan) => {
  const prototypes = preprocess(types, tools, plan);
  if (prototypes.length === 1) return prototypes[0];
  if (!prototypes.length) return { test: () => [], ts: () => 'unknown', debug: 'Check warnings' };
  const { condition = 'anyof' } = plan;
  // TODO: assign Meta information
  return {
    type: () => 'object',
    test: (sample, path = 'root') => {
      const handler = tools.conditions(condition, prototypes.length - 1);
      const errors = [];
      for (let i = 0; i < prototypes.length; ++i) {
        const result = prototypes[i].test(sample, path);
        const [toDo, err] = handler(result, i);
        if (err) {
          if (result.length) errors.push(...result);
          else errors.push(`[${path}] => ${err}: ${JSON.stringify(sample)}`);
        }
        if (toDo === 'skip' || toDo === 'break') break;
        if (toDo === 'continue') continue;
      }
      return errors;
    },
  };
};
