'use strict';

const scalar = type => {
  const parse = () => ({ type });
  const isCompatible = sample => typeof sample === type;

  return {
    kind: 'scalar',
    parse: Object.assign(parse, { isCompatible, targets: [type] }),
    construct(schema, tools) {
      const { isRequired, Error } = tools;
      const required = isRequired(schema);
      return (sample, path) => {
        if (typeof sample === type) return [];
        if (sample === undefined && !required) return [];
        return [new Error({ path, sample, schema, cause: `Not of expected type: ${type}` })];
      };
    },
  };
};

module.exports = {
  string: scalar('string'),
  bigint: scalar('bigint'),
  number: scalar('number'),
  boolean: scalar('boolean'),
};
