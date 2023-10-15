'use strict';

const any = type => ({
  kind: 'scalar',
  type,
  build(plan, builder) {
    const required = builder.isRequired(plan);
    return (sample, path) => {
      if (required && sample === undefined) return [`[${path}] => is Required`];
      return [];
    };
  },
});

const json = {
  kind: 'struct',
  build: () => (sample, path) => {
    if (typeof sample === 'object' && sample) return [];
    return [`[${path}] => Not of expected type: object`];
  },
};

module.exports = { any: any('any'), unknown: any('unknown'), json };
