'use strict';

const arrayBuilder = builder => schema => schema.items.map(builder.build);
const [objectBuilder, createError] = [require('./object'), require('../error')];
const preprocess = require('../preprocess');

module.exports = function Builder(types) {
  Object.assign(this, Object.freeze(require('../utils')));
  this.builders = { object: objectBuilder(this), array: arrayBuilder(this) };
  this.Error = createError();

  this.build = schema => {
    const { tests, warnings } = preprocess(schema, types, this);
    const { typeCondition = 'anyof' } = schema;
    const test = (sample, path = 'root') => {
      const handler = this.conditions(typeCondition, tests.length - 1);
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

    return Object.assign(test, { warnings });
  };

  return Object.freeze(this);
};
