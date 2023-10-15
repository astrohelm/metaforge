'use strict';

const object = {
  kind: 'struct',
  entries: value => Object.entries(value),
  isInstance: value => typeof value === 'object',
  build(schema, { builders }) {
    const { search, required } = builders['object'](schema);
    return (sample, path) => {
      if (!this.isInstance(sample)) return [`[${path}] => Type miss ${schema.type}`];
      if (schema.required && !sample) return [`[${path}] => Is required`];
      if (!schema.required && !sample) return [];
      const entries = this.entries(sample);
      if (!entries.length && schema.required) return [`[${path}] => Is required`];
      const errors = [];
      for (const [prop, value] of entries) {
        const [test, schemaProp] = search(prop);
        if (!test) {
          errors.push(`[${path}.${prop}] => Exotic property`);
          continue;
        }
        required.delete(schemaProp ?? prop);
        const result = test(value, `${path}.${prop}`);
        if (result.length) errors.push(...result);
      }
      if (required.size) {
        const err = `[${path}] => Missing fields "${[...required.keys()].join()}" in sample`;
        errors.push(err);
      }
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
