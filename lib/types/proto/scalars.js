'use strict';

const scalar = type => {
  const parse = () => ({ type });
  const isCompatible = sample => typeof sample === type;

  return {
    kind: 'scalar',
    parse: Object.assign(parse, { isCompatible, targets: [type] }),
    build(schema, builder) {
      const required = builder.isRequired(schema);
      return (sample, path) => {
        if (typeof sample === type) return [];
        if (sample === undefined && !required) return [];
        return [`[${path}] => Not of expected type: ${type}`];
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
