'use strict';

const parse = () => ({ type: 'date' });
const isCompatible = sample => sample instanceof Date;
Object.assign(parse, { isCompatible, targets: ['object'] });

const date = {
  kind: 'scalar',
  parse,
  build: () => ({
    test: sample => !isNaN(new Date(sample)),
    error: args => `Field "${args.path}" contains invalid date`,
  }),
};

module.exports = { date };
