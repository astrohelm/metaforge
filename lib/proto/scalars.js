'use strict';

const scalar = type => {
  const compare = value => typeof value !== type;
  const error = args => `Type mismatch ${type} !== ${typeof args.value}`;
  return Object.assign(compare, { type, error, kind: 'scalar' });
};

module.exports = {
  string: scalar.bind(null, 'string'),
  number: scalar.bind(null, 'number'),
  bigint: scalar.bind(null, 'bigint'),
  boolean: scalar.bind(null, 'boolean'),
};
