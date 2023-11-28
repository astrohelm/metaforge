'use strict';

const format = dict => `[${dict.path}] => ${dict.cause}`;
const define = (ctx, name, value) => Object.defineProperty(ctx, name, { enumerable: false, value });
function SchemaError({ path = 'unknown', sample, plan, cause, sampleType }) {
  [this.count, this.path, this.cause] = [0, path, ''];
  if (sample) [this.sample, this.sampleType] = [sample, sampleType ?? typeof sample];
  if (cause) this.cause = (++this.count, cause);
  if (plan) this.plan = plan;
  this.message = format(this);
  define(this, 'toString', () => this.message);
  define(this, 'toJSON', () => ({ sample, path, cause: this.cause, count: this.count }));
  define(this, 'add', cause => {
    this.cause = this.cause ? `${this.cause}, ${cause}` : cause;
    this.message = (++this.count, format(this));
    return this;
  });
}

function Snitch(storage = []) {
  return Object.assign(warn, { warnings: storage });
  function warn(options) {
    const warn = new SchemaError({ path: 'BUILD', ...options });
    return storage.push(warn), warn;
  }
}

const entries = protos => {
  if (Array.isArray(protos) && protos[0]?.length === 2) return protos;
  return protos?.constructor.name === 'Map' ? [...protos.entries()] : Object.entries(protos);
};

module.exports = { SchemaError, Snitch, entries };
