'use strict';

const enumerable = type => {
  const compare = value => type.includes(value);
  const error = args => `Enum ${JSON.stringify(type)} doesn't include ${args.value}`;
  return Object.assign(compare, { type, error, kind: 'scalar' });
};

module.exports = enumerable;
