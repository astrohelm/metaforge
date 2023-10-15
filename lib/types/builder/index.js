'use strict';

const arrayBuilder = (schema, { builder }) => schema.items.map(v => builder.build(v));
const [objectBuilder, createError] = [require('./object'), require('../error')];
const preprocess = require('../preprocess');

module.exports = function Builder(types) {
  Object.assign(this, Object.freeze(require('../utils')));
  this.builders = { object: objectBuilder, array: arrayBuilder };
  this.Error = createError();

  this.build = schema => {
    const warnings = [];
    const warn = options => {
      const err = new this.Error(options);
      return warnings.push(err), err;
    };
    const tooling = { builder: Object.freeze({ ...this, build }), warn };
    function build(schema, tools = tooling) {
      const tests = preprocess(schema, types, tools);
      const { typeCondition = 'anyof' } = schema;
      return (sample, path = 'root') => {
        const handler = tools.builder.conditions(typeCondition, tests.length - 1);
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
    }
    return Object.assign(build(schema), { warnings });
  };
  return Object.freeze(this);
};
