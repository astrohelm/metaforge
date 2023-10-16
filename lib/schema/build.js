'use strict';

const preprocess = require('./preprocess');
module.exports = (types, tools, schema) => {
  const tests = preprocess(types, tools, schema);
  const { typeCondition = 'anyof' } = schema;
  return (sample, path = 'root') => {
    const handler = tools.conditions(typeCondition, tests.length - 1);
    const errors = [];
    for (let i = 0; i < tests.length; ++i) {
      const result = tests[i](sample, path);
      const [toDo, err] = handler(result, i);
      if (err) {
        if (result.length) errors.push(...result);
        else errors.push(`[${path}] => ${err}: ${JSON.stringify(sample)}`);
      }
      if (toDo === 'skip' || toDo === 'break') break;
      if (toDo === 'continue') continue;
    }
    return errors;
  };
};
