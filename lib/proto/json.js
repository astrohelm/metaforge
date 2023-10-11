'use strict';

module.exports = {
  kind: 'struct',
  constructor: () => {},
  compare: (value, path) => {
    if (typeof value !== 'object' || !value) {
      return [`Field "${path}" not of expected type: object`];
    }
    return [];
  },
};
