'use strict';

const astropack = require('astropack');

const array = {
  kind: 'struct',
  isInstance: value => Array.isArray(value),
  build(schema, { builders, conditions, Error }) {
    const builded = builders.array(schema);
    const { type, condition = 'anyof', required } = schema;
    return (sample, path) => {
      const err = cause => new Error({ path, sample, schema, cause });
      if (!this.isInstance(sample)) return [err(`Type miss: ${type}`)];
      const entries = [...sample];
      if (!entries.length && required) return [err(`Is required`)];
      const errors = [];
      point: for (let i = 0; i < entries.length; ++i) {
        const handler = conditions(condition, builded.length - 1);
        const err = cause => new Error({ path: `[${path}[${i}]]`, sample, schema, cause });
        for (let j = 0; j < builded.length; ++j) {
          const result = builded[j](entries[i], `${path}[${i}]`);
          const [toDo, error] = handler(result, j);
          if (error) {
            if (result.length) errors.push(...result);
            else errors.push(err(error + `: ${JSON.stringify(entries[i])}`));
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
