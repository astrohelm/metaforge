'use strict';

const any = type => ({
  kind: 'scalar',
  type,
  build(schema, { isRequired, Error }) {
    const required = isRequired(schema);
    return (sample, path) => {
      if (!(required && sample === undefined)) return [];
      return [new Error({ path, sample, schema, cause: 'Is required' })];
    };
  },
});

const json = {
  kind: 'struct',
  build: schema => (sample, path) => {
    if (typeof sample === 'object' && sample) return [];
    return [new Error({ path, sample, schema, cause: 'Not of expected type: object' })];
  },
};

module.exports = { any: any('any'), unknown: any('unknown'), json };
