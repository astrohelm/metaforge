'use strict';

const defaultTest = () => [];
const INVALID = 'Invalid prototype, missing construct method';

const parse = (res, options, cause) => {
  const { sample, path, plan, tools } = options;
  if (typeof res === 'object' && Array.isArray(res)) {
    if (!res.length || res[0] instanceof tools.Error) return res;
    return res.map(v => parse(v, options)).flat(2);
  }
  if (typeof res === 'boolean' && !res) return [new tools.Error({ sample, path, plan, cause })];
  if (typeof res === 'string') return [new tools.Error({ sample, path, plan, cause: res })];
  if (res instanceof tools.Error) return [res];
  return [];
};

const constructor = (name, proto, defaultMeta) => {
  if (!proto?.construct || typeof proto.construct !== 'function') throw new Error(INVALID);
  const meta = { type: name };
  if (proto.meta) Object.assign(meta, proto.meta);
  if (defaultMeta) Object.assign(meta, defaultMeta);
  function Type(plan, tools) {
    Object.assign(this, meta);
    if (plan.meta) Object.assign(this, plan.meta);
    proto.construct.call(this, plan, tools);
    if (!this.type) this.type = 'unknown';
    if (!('required' in this)) this.required = tools.isRequired(plan);
    const test = this.test ?? defaultTest;
    const rules = plan.rules ?? [];
    this.test = (sample, path = 'root') => {
      const options = { sample, path, tools, plan };
      const errors = parse(test(sample, path), options, `Didn't pass test`);
      if (rules.length === 0) return errors;
      for (let i = 0; i < rules.length; ++i) {
        const result = parse(rules[i](sample), options, `Didn't pass rule[${i}]`);
        if (result.length > 0) {
          const err = result.map(cause => new tools.Error({ sample, path, cause, plan }));
          errors.push(...err);
        }
      }
      return errors;
    };
    return Object.freeze(this);
  }
  if (proto.parse && Array.isArray(proto.parse.targets)) Type.parse = proto.parse;
  return Object.assign(Type, meta);
};

module.exports = constructor;
