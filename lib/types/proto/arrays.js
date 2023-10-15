'use strict';

const astropack = require('astropack');

const conditions = (condition, max) => {
  let flag = false;
  if (condition === 'allof') {
    return (result, i) => {
      if (result.length > 0) return ['break', 'Array item did not pass one of schema'];
      if (i === max) return ['skip'];
      return ['continue'];
    };
  }
  if (condition === 'oneof') {
    return (result, i) => {
      if (flag && result.length === 0) return ['break', 'Array item passed more than one schema'];
      if (result.length === 0) flag = true;
      if (!flag && i === max) return ['break', 'Array item did not pass all schemas'];
      if (flag && i === max) return ['skip'];
      return ['continue'];
    };
  }
  return (result, i) => {
    if (result.length !== 0 && i >= max) return ['break', 'Array item did not pass all schemas'];
    if (result.length === 0) return ['skip'];
    return ['continue'];
  };
};

const array = {
  kind: 'struct',
  isInstance: value => Array.isArray(value),
  build(schema, { builders }) {
    const builded = builders.array(schema);
    const { type, condition = 'anyof', required } = schema;
    return (sample, path) => {
      if (!this.isInstance(sample)) return [`[${path}] => Type miss: ${type}`];
      const entries = [...sample];
      if (!entries.length && required) return [`[${path}] => Is required`];
      const errors = [];
      point: for (let i = 0; i < entries.length; i++) {
        const handler = conditions(condition, builded.length - 1);
        const error = err => `[${path}[${i}]] => ${err}`;
        for (let j = 0; j < builded.length; j++) {
          const result = builded[j](entries[i], `${path}[${i}]`);
          const [toDo, err] = handler(result, j);
          if (err) {
            errors.push(error('Array item miss: ' + condition));
            errors.push(error(err + `: ${JSON.stringify(entries[i])}`), ...result);
          }
          if (toDo === 'break') break;
          if (toDo === 'continue') continue;
          if (toDo === 'skip') continue point;
        }
      }
      return errors;
    };
  },
};

const set = {
  ...array,
  isInstance: value => value?.constructor?.name === 'Set',
};

const parse = (sample, parse) => {
  const items = sample.reduce((acc, sample) => {
    const schema = parse(sample);
    for (const saved of acc) if (astropack.equals(saved, schema)) return acc;
    return acc.push(schema), acc;
  }, []);
  if (items.length === 0) return { type: 'array', items: ['unknown'] };
  if (items.length === 1) return { type: 'array', items: [items[0]] };
  return { type: 'array', items };
};

array.parse = Object.assign(parse, { isCompatible: array.isInstance, targets: ['object'] });
module.exports = { array, set };
