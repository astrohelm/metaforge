'use strict';

const preprocess = require('./preprocess');

//? [Preprocess] Purpose: find, join and build prototype by plan
module.exports = (types, tools, plan) => {
  const prototypes = preprocess(types, tools, plan);
  if (prototypes.length === 1) return prototypes[0];
  if (!prototypes.length) return { test: () => [], ts: () => 'unknown', debug: 'Check warnings' };
  const { condition: conditionName = 'anyof' } = plan;

  return {
    prototypes,
    type: () => 'object',
    test: (sample, path = 'root') => {
      const createError = cause => new tools.Error({ cause, path, sample });
      const condition = tools.getCondition(conditionName, prototypes.length - 1);
      return tools.runCondition(condition, { path, sample, createError, prototypes });
    },
  };
};
