'use strict';

const { process, search, parser, buildProps } = require('./utils');
const ERR_MISS = 'Data type misconfiguration, expected: ';
const ERR_EMPTY = 'Empty object received, but required';
const ERR_REQUIRED = `Properties and value required`;

module.exports = protoTools => ({
  meta: { kind: 'struct', origin: 'default' },
  parse: Object.assign(parser(protoTools), { targets: ['object'] }),
  construct(plan, tools) {
    const { Error } = tools;
    const allowExotic = plan.allowExotic ?? false;
    const requires = buildProps(this, plan, tools);

    this.required = plan.required ?? true;
    this.ts = () => 'object';
    this.test = (sample, path) => {
      const createError = cause => new Error({ path, sample, plan, cause });
      if (!this.required && sample === undefined) return [];
      if (this.required && sample === undefined) return [createError(ERR_REQUIRED)];
      if (!protoTools.isInstance(sample)) return [createError(ERR_MISS + this.type)];
      const keys = protoTools.getKeys(sample);
      if (!keys.length && this.required) return [createError(ERR_EMPTY)];
      const [errors, test] = [[], process(protoTools.getValue, protoTools.setValue, sample)];
      for (const prop of keys) {
        const createError = cause => new Error({ path: `${path}.${prop}`, sample, plan, cause });
        const [prototype, schemaProp] = search(this, prop);
        if (!prototype) {
          if (!allowExotic) errors.push(createError(`Exotic property`));
          continue;
        }
        requires.delete(schemaProp ?? prop);
        const result = test(prototype, prop, `${path}.${prop}`);
        if (result.length) errors.push(...result);
      }
      if (requires.size) {
        for (const prop of requires.keys()) {
          const prototype = this.properties[prop] ?? this.patternProperties[prop];
          if (!prototype.preprocess) continue;
          const result = (requires.delete(prop), test(prototype, prop, `${path}.${prop}`));
          if (result.length) errors.push(...result);
        }
        requires.size && errors.push(createError(`Missing "${[...requires.keys()].join()}"`));
      }
      return errors;
    };
  },
});
