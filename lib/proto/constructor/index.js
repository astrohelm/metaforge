'use strict';

const defaultTest = () => [];
const INVALID = 'Invalid prototype, missing construct method';
const TEST_FAIL = `Didn't pass test`;
const RULE_FAIL = `Didn't pass rule: `;
const { parseResult: parse, setDefault } = require('./utils');

//? [Pre-preprocess] Purpose: Prototype wrapper and tester
module.exports = (name, proto, defaultMeta) => {
  if (!proto?.construct || typeof proto.construct !== 'function') throw new Error(INVALID);
  const meta = { type: name };
  function Type(plan, tools) {
    Object.assign(this, meta);
    if (plan.meta) Object.assign(this, plan.meta);
    proto.construct.call(this, plan, tools), setDefault(this, plan, tools);

    const [test, rules] = [this.test ?? defaultTest, plan.rules ?? []];
    this.test = (sample, path = 'root') => {
      const options = { sample, path, tools, plan };
      const errors = parse(test(sample, path), options, TEST_FAIL);
      if (rules.length === 0) return errors;
      for (let i = 0; i < rules.length; ++i) {
        const result = parse(rules[i](sample), options, RULE_FAIL + i);
        if (result.length > 0) errors.push(...result);
      }
      return errors;
    };
    return Object.freeze(this);
  }
  if (proto.meta) Object.assign(meta, proto.meta);
  if (defaultMeta) Object.assign(meta, defaultMeta);
  if (proto.parse && Array.isArray(proto.parse.targets)) Type.parse = proto.parse;
  return Object.assign(Type, meta);
};
