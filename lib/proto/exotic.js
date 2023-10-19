'use strict';

const ERR_REQUIRED = 'Value is required';
const ERR_MISS = 'Not of expected type: object';
const META = { kind: 'scalar', origin: 'default' };
const any = {
  meta: META,
  construct(plan, tools) {
    const { isRequired, Error } = tools;
    this.required = isRequired(plan);
    this.ts = () => this.type;
    this.test = (sample, path) => {
      if (!(!this.required && sample === undefined)) return [];
      return [new Error({ path, sample, plan, cause: ERR_REQUIRED })];
    };
  },
};

const json = {
  meta: { kind: 'struct', origin: 'default' },
  construct(plan, tools) {
    const { isRequired, Error } = tools;
    this.required = isRequired(plan);
    this.ts = () => 'object';
    this.test = (sample, path) => {
      if (typeof sample === 'object' && sample) return [];
      if (!this.required && sample === undefined) return [];
      return [new Error({ path, sample, plan, cause: ERR_MISS })];
    };
  },
};

module.exports = { any, unknown: any, json };
