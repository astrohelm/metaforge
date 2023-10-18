'use strict';

const MISS = 'Data type missconfiguration, expexted: ';
const EMPTY = 'Empty object reviced, but required';
const search = (schema, prop) => {
  if (!schema.properties) return [null, null];
  if (prop in schema.properties) return [schema.properties[prop], null];
  if (!schema.patternProperties) return [null, null];
  const entries = Object.entries(schema.patternProperties);
  if (typeof prop !== 'string') prop = String(prop);
  for (const [pattern, value] of entries) if (prop.match(pattern)) return [value, pattern];
  return [null, null];
};

const struct = ({ isInstance, getEntries }) => ({
  meta: { kind: 'struct', subtype: 'hashmap' },
  construct(plan, tools) {
    const { Error, isRequired, build } = tools;
    const allowExotic = plan.allowExotic ?? false;

    const requires = new Map();
    const builded = { properties: {}, patternProperties: {} };
    for (const propType in builded) {
      if (!plan[propType]) continue;
      const entries = Object.entries(plan[propType]);
      for (const [key, value] of entries) {
        builded[propType][key] = build(value);
        const required = isRequired(value);
        if (required) requires.set(key);
      }
      this[propType] = Object.assign({}, builded[propType]);
    }

    this.type = plan.type;
    this.required = plan.required ?? true;
    this.ts = () => 'object';
    this.test = (sample, path) => {
      const err = cause => new Error({ path, sample, plan, cause });
      if (!this.required && sample === undefined) return [];
      if (this.required && !sample) return [err(`Is required`)];
      if (!isInstance(sample)) return [err(MISS + this.type)];
      const entries = getEntries(sample);
      if (!entries.length && this.required) return [err(EMPTY)];
      const errors = [];
      for (const [prop, value] of entries) {
        const err = cause => new Error({ path: `${path}.${prop}`, sample, plan, cause });
        const [prototype, schemaProp] = search(this, prop);
        if (!prototype) {
          if (!allowExotic) errors.push(err(`Exotic property`));
          continue;
        }
        requires.delete(schemaProp ?? prop);
        const result = prototype.test(value, `${path}.${prop}`);
        if (result.length) errors.push(...result);
      }
      if (requires.size) errors.push(err(`Missing fields "${[...requires.keys()].join()}"`));
      return errors;
    };
  },
});

module.exports = {
  object: struct({
    isInstance: v => typeof v === 'object',
    getEntries: v => Object.entries(v),
  }),
  map: struct({
    isInstance: v => v?.constructor?.name === 'Map',
    getEntries: v => v.entries(),
  }),
};
