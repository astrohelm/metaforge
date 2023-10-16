'use strict';

const MAP = { s: 'sample', c: 'cause', p: 'path' };
module.exports = (options = {}) => {
  const { pattern = '[P] => C' } = options;
  const format = dict => pattern.toLowerCase().replace(/[scp]/g, char => dict[MAP[char]]);

  return function Error({ path, sample, schema, cause, sampleType }) {
    [this.count, this.path, this.cause] = [0, path, ''];
    if (sample) [this.sample, this.sampleType] = [sample, sampleType ?? typeof sample];
    if (schema) this.schema = schema;
    if (cause) [this.cause, this.count] = [cause, this.count + 1];
    const toString = () => this.message;
    const toJSON = () => ({ sample, path, cause: this.cause, count: this.count });
    const add = cause => {
      cause = this.cause ? `${this.cause}, ${cause}` : cause;
      [this.count, this.cause] = [this.count + 1, cause];
      this.message = format(this);
      return this;
    };
    Object.defineProperty(this, 'add', { enumerable: false, value: add });
    Object.defineProperty(this, 'toJSON', { enumerable: false, value: toJSON });
    Object.defineProperty(this, 'toString', { enumerable: false, value: toString });
    Object.defineProperty(this, 'message', {
      enumerable: false,
      writable: true,
      value: format(this),
    });
  };
};
