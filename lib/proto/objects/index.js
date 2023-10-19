'use strict';

const struct = require('./struct');

module.exports = {
  object: struct({
    isInstance: v => typeof v === 'object',
    getKeys: v => Object.keys(v),
    getValue: (k, target) => target[k],
    setValue: (k, v, target) => (target[k] = v),
  }),
  map: struct({
    isInstance: v => v?.constructor?.name === 'Map',
    getKeys: v => [...v.keys()],
    getValue: (k, target) => target.get(k),
    setValue: (k, v, target) => target.set(k, v),
  }),
};
