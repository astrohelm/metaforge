'use strict';

const MISS = 'Data type missconfiguration, expexted: ';
const EMPTY = 'Empty list reviced, but required';
const struct = isInstance => ({
  meta: { kind: 'struct', subtype: 'array' },
  construct(plan, tools) {
    const { Error, build, conditions } = tools;
    this.required = plan.required ?? true;
    this.items = plan.items.map(v => build(v));
    this.condition = plan.condition ?? 'anyof';
    this.type = plan.type;

    this.ts = () => 'object';
    this.test = (sample, path) => {
      const err = cause => new Error({ path, sample, plan, cause });
      if (!isInstance(sample)) return [err(MISS + this.type)];
      const entries = [...sample];
      if (!entries.length && this.required) return [err(EMPTY)];
      const errors = [];
      point: for (let i = 0; i < entries.length; ++i) {
        const handler = conditions(this.condition, this.items.length - 1);
        const err = cause => new Error({ path: `[${path}[${i}]]`, sample, plan, cause });
        for (let j = 0; j < this.items.length; ++j) {
          const result = this.items[j].test(entries[i], `${path}[${i}]`);
          const [toDo, error] = handler(result, j);
          if (error) {
            if (result.length) errors.push(...result);
            else errors.push(err(error + `: ${JSON.stringify(entries[i])}`));
          }
          if (toDo === 'break') break;
          if (toDo === 'continue') continue;
          if (toDo === 'skip') continue point;
        }
      }
      return errors;
    };
  },
});

module.exports = {
  array: struct(value => Array.isArray(value)),
  set: struct(value => value?.constructor?.name === 'Set'),
};
