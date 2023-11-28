'use strict';

const { unionHandler, instanceOfArray, objectEntries } = require('./utils');

const WRONG_TYPE = 'Type misconfiguration, expected type: ';
const create = type => {
  const invalid = WRONG_TYPE + type;
  return function Scalar() {
    this.test = sample => (typeof sample === type ? null : invalid);
  };
};

module.exports = new Map(
  Object.entries({
    union: Union,
    set: Iterable,
    array: Iterable,
    tuple: Iterable,
    boolean: create('boolean'),
    string: create('string'),
    number: create('number'),
    bigint: create('bigint'),
    object: Struct,
    record: Struct,
    map: Struct,
    enum: Enum,
    null: Null,
  }),
);

function Null() {
  this.test = sample => {
    if (sample === null) return null;
    return WRONG_TYPE + this.$type;
  };
}

const NOT_AT_ENUM = `Enum doesn't contain this value, enum: `;
function Enum() {
  this.test = sample => {
    if (this.$enum.includes(sample)) return null;
    return NOT_AT_ENUM + this.$enum.join(', ');
  };
}

const EMPTY_ERROR = 'Empty data received';
const TUPLE_ERROR = 'Received items length does not match expected length';
const INCOR_ERROR = 'Data type misconfiguration, expected: ';
function Iterable() {
  this.test = (sample, path, isPartial) => {
    if (!instanceOfArray(sample)) return [INCOR_ERROR + this.$type];
    const entries = [...sample];
    if (!entries.length && this.$required) return [EMPTY_ERROR];
    if (this.$isTuple && entries.length !== this.$items.length) return [TUPLE_ERROR];
    const errors = [];
    for (let i = 0; i < entries.length; i++) {
      const test = this.$isTuple ? this.$items[i].test : this.$items[0].test;
      const result = test(entries[i], `${path}[${i}]`, isPartial);
      result.length && errors.push(...result);
    }
    return errors;
  };
}

const EXOTC_ERROR = 'Exotic properties: ';
const RELIC_ERROR = 'Missing properties: ';
function Struct() {
  const pull = prop => {
    const patterns = this.$patterns.entries();
    const temp = this.$properties.get(prop);
    if (temp) return [prop, temp];
    if (typeof prop !== 'string') prop = String(prop);
    for (var [pattern, value] of patterns) if (prop.match(pattern)) return [pattern, value];
    return [null, null];
  };

  this.test = (sample, path, isPartial) => {
    const requires = this.$requires.reduce((acc, prop) => acc.set(prop), new Map());
    const entries = objectEntries(sample);
    if (!entries) return [INCOR_ERROR + this.$type];
    if (!entries.length && this.$required) return [EMPTY_ERROR];
    const errors = [];
    for (var [prop, item] of entries) {
      var [key, prototype] = pull(prop);
      if (!key && this.$isRecord) errors.push(EXOTC_ERROR);
      if (!key) continue;
      var result = prototype.test(item, `${path}.${prop}`, isPartial);
      requires.delete(key), result.length && errors.push(...result);
    }
    !isPartial && requires.size && errors.push(RELIC_ERROR + [...requires.keys()].join(', '));
    return errors;
  };
}

function Union() {
  this.test = (sample, path, isPartial) => {
    const [errors, handler] = [[], unionHandler(this.$condition, this.$types.length - 1)];
    for (let i = 0; i < this.$types.length; ++i) {
      var result = this.$types[i].test(sample, path, isPartial);
      var [message, deepErrors] = handler(result, i);
      if (message === 'ok') return [];
      if (deepErrors && deepErrors.length > 0) errors.push(...deepErrors);
      if (message !== 'continue') return errors.push(message), errors;
    }
    return errors;
  };
}
