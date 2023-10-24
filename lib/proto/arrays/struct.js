'use strict';

const ERR_MISS = 'Data type misconfiguration, expected: ';
const ERR_EMPTY = 'Empty list received, but required';
module.exports = isInstance => ({
  meta: { kind: 'struct', origin: 'default' },
  construct(plan, tools) {
    const { Error, build, getCondition } = tools;
    this.required = plan.required ?? true;
    this.items = Array.isArray(plan.items) ? plan.items.map(v => build(v)) : [build(plan.items)];
    this.condition = plan.condition ?? 'anyof';

    this.ts = () => 'object';
    this.test = (sample, path) => {
      const createError = cause => new Error({ path, sample, plan, cause });
      if (!isInstance(sample)) return [createError(ERR_MISS + this.type)];
      const entries = [...sample];
      if (!entries.length && this.required) return [createError(ERR_EMPTY)];
      const errors = [];
      for (let i = 0; i < entries.length; ++i) {
        const condition = getCondition(this.condition, this.items.length - 1);
        const suboption = { path: `${path}[${i}]`, sample: entries[i] };
        const createError = cause => new tools.Error({ cause, plan, ...suboption });
        const option = { createError, prototypes: this.items, ...suboption };
        const result = tools.runCondition(condition, option);
        if (result.length) errors.push(...result);
      }
      return errors;
    };
  },
});
