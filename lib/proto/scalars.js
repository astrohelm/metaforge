'use strict';

const scalar = {
  kind: 'scalar',
  constructor: () => {},
  compare(value, path) {
    if (typeof value !== this.type) return [`Field "${path}" not of expected type: ${this.type}`];
    return [];
  },
};

const enumerable = {
  kind: 'scalar',
  constructor(definition) {
    this.type = definition;
  },
  compare(value, path) {
    if (this.type.includes(value)) return [];
    return [`Field "${path}" value is not of enum: ${this.type.join(', ')}`];
  },
};

module.exports = {
  string: { type: 'string', rules: ['length'], ...scalar },
  number: { type: 'number', rules: ['length'], ...scalar },
  bigint: { type: 'bigint', rules: ['length'], ...scalar },
  boolean: { type: 'boolean', ...scalar },
  enum: enumerable,
};
