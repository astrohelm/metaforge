'use strict';

const define = (ctx, name, value) => Object.defineProperty(ctx, name, { enumerable: false, value });
const defaultFormat = dict => `[${dict.path}] => ${dict.cause}`;

module.exports = (options = {}) => {
  const { format = defaultFormat } = options;
  return function SchemaError({ path, sample, plan, cause, sampleType }) {
    [this.count, this.path, this.cause] = [0, path, ''];
    if (sample) [this.sample, this.sampleType] = [sample, sampleType ?? typeof sample];
    if (cause) this.cause = (++this.count, cause);
    if (plan) this.plan = plan;
    this.message = format(this);
    define(this, 'toString', () => this.message);
    define(this, 'toJSON', () => ({ sample, path, cause: this.cause, count: this.count }));
    define(this, 'message', format(this));
    define(this, 'add', cause => {
      this.cause = this.cause ? `${this.cause}, ${cause}` : cause;
      this.message = (++this.count, format(this));
      return this;
    });
  };
};
