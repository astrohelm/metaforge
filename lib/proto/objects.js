'use strict';

const object = {
  kind: 'struct',
  entries: value => Object.entries(value),
  isInstance: value => typeof value === 'object',
  construct(schema, tools) {
    const { Error, builders } = tools;
    const { search, required } = builders['object'](schema, tools);
    return (sample, path) => {
      const err = cause => new Error({ path, sample, schema, cause });
      if (!this.isInstance(sample)) return [err(`Type miss ${schema.type}`)];
      if (schema.required && !sample) return [err(`Is required`)];
      if (!schema.required && !sample) return [];
      const entries = this.entries(sample);
      if (!entries.length && schema.required) return [err(`Is required`)];
      const errors = [];
      for (const [prop, value] of entries) {
        const err = cause => new Error({ path: `${path}.${prop}`, sample, schema, cause });
        const [test, schemaProp] = search(prop);
        if (!test) {
          errors.push(err(`Exotic property`));
          continue;
        }
        required.delete(schemaProp ?? prop);
        const result = test(value, `${path}.${prop}`);
        if (result.length) errors.push(...result);
      }
      if (required.size) errors.push(err(`Missing fields "${[...required.keys()].join()}"`));
      return errors;
    };
  },
};

const map = {
  ...object,
  isInstance: value => value?.constructor?.name === 'Map',
  entries: value => value.entries(),
};

const parse = (sample, parse) => {
  const properties = Object.entries(sample).reduce((acc, [key, prop]) => {
    acc[key] = parse(prop);
    return acc;
  }, {});
  return { type: 'object', properties };
};

object.parse = Object.assign(parse, { isCompatible: object.isInstance, targets: ['object'] });
module.exports = { object, map };
