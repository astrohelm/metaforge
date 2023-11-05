'use strict';

module.exports = new Map(
  Object.entries({
    union: Union,
    set: Iterable,
    array: Iterable,
    tuple: Iterable,
    boolean: Scalar,
    string: Scalar,
    number: Scalar,
    bigint: Scalar,
    object: Struct,
    record: Struct,
    map: Struct,
    enum: Enum,
  }),
);

const { unionHandler, instanceOfArray, objectEntries } = require('./utils');

const WRONG_TYPE = 'Type misconfiguration, expected type: ';
function Scalar() {
  this.test = sample => {
    if (typeof sample === this.$type) return null;
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

const EMPTY_ERROR = 'Empty data recieved';
const TUPLE_ERROR = 'Recieved items length does not match expected length';
const INCOR_ERROR = 'Data type misconfiguration, expected: ';
function Iterable() {
  this.test = (sample, path, isPartial) => {
    if (!instanceOfArray(this.$type, sample)) return [INCOR_ERROR + this.$type];
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

const EXOTC_ERROR = 'Exotic propertie: ';
const RELIC_ERROR = 'Missing properties: ';
function Struct() {
  const pull = prop => {
    const patterns = this.$patterns.entries();
    const temp = this.$properties.get(prop);
    if (temp) return [prop, temp];
    if (typeof prop !== 'string') prop = String(prop);
    for (const [pattern, value] of patterns) if (prop.match(pattern)) return [pattern, value];
    return [null, null];
  };

  this.test = (sample, path, isPartial) => {
    const requires = this.$requires.reduce((acc, prop) => acc.set(prop), new Map());
    const entries = objectEntries(this.$type, sample);
    if (!entries) return [INCOR_ERROR + this.$type];
    if (!entries.length && this.$required) return [EMPTY_ERROR];
    const errors = [];
    for (const [prop, sample] of entries) {
      const [key, prototype] = pull(prop);
      if (!key && this.$isRecord) errors.push(EXOTC_ERROR);
      if (!key) continue;
      const result = prototype.test(sample, `${path}.${prop}`, isPartial);
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
      const result = this.$types[i].test(sample, path, isPartial);
      const [message, deepErrors] = handler(result, i);
      if (message === 'ok') return [];
      if (deepErrors && deepErrors.length > 0) errors.push(...deepErrors);
      if (message !== 'continue') return errors.push(message), errors;
    }
    return errors;
  };
}
