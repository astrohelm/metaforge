'use strict';

const { objectEntries, unifyResult } = require('./utils');
const prototypes = require('./tests');

const DID_NOT_PASSED = 'Test failed: ';
const RULE_NOT_EXIST = `Missing rule: `;
const REQUIRE_SAMPLE = 'Recieved empty sample';
module.exports = ({ forge }, { rules }) => {
  for (const [name, proto] of prototypes.entries()) forge.set(name, proto);
  const schemaRules = rules ? new Map(objectEntries(rules)) : new Map();
  forge.set('after', function TestWrapper(plan, { Error }) {
    if (plan.$type === 'schema') return this.test;
    const planRules = plan?.$rules;
    const rules = Array.isArray(planRules) ? planRules : [planRules];
    const tests = rules.filter(test => typeof test === 'string' || typeof test === 'function');
    typeof this.test === 'function' && tests.unshift(this.test);
    this.test = (sample, path = 'root', isPartial = false) => {
      const err = (def, cause = def) => new Error({ cause, path, plan, sample });
      if (sample === undefined) return this.$required ? [err(REQUIRE_SAMPLE)] : [];
      const errors = [];
      for (let i = 0; i < tests.length; i++) {
        let [rule, name] = [tests[i], i - 1 < 0 ? 'Prototype test' : 'Rule №' + i];
        if (typeof rule === 'string') [rule, name] = [schemaRules.get(rule), rule];
        const result = rule ? rule(sample, path, isPartial) : RULE_NOT_EXIST + name;
        errors.push(...unifyResult(result, err.bind(null, DID_NOT_PASSED + name)));
      }
      return Object.assign(errors, { valid: errors.length === 0 });
    };
  });
};
