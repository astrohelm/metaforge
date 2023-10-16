'use strict';

const STANDARD = ['string', 'number', 'bigint', 'boolean', 'object', 'array'];

module.exports = function Store(custom) {
  const store = STANDARD.reduce((acc, t) => {
    acc[t] = new TypeStorage(t, prototypes[t]);
    return acc;
  }, {});

  const entries = Object.entries(custom);
  entries.forEach((v, k) => {
    if(v)
  })
  for (const [key, proto] of entries) {
  }
  return store;
}
new Map().forEach()

// const name = 'MySchema';
// cosnt types = new Map(); // Prototypes
// const namespace = new Map(); // Plans
// const options = { types, namespace }
// new Schema(plan, options)
// schema.dts(name)
