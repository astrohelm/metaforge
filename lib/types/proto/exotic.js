'use strict';

const any = type => ({
  kind: 'scalar',
  type,
  construct(schema, tools) {
    const { isRequired, Error } = tools.builder;
    const required = isRequired(schema);
    return (sample, path) => {
      if (!(required && sample === undefined)) return [];
      return [new Error({ path, sample, schema, cause: 'Is required' })];
    };
  },
});

const json = {
  kind: 'struct',
  construct: (schema, tools) => {
    const { Error } = tools.builder;
    return (sample, path) => {
      if (typeof sample === 'object' && sample) return [];
      return [new Error({ path, sample, schema, cause: 'Not of expected type: object' })];
    };
  },
};

module.exports = { any: any('any'), unknown: any('unknown'), json };
