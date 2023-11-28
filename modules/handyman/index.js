'use strict';

const RepairKit = require('./repairkit');
const MISSING_MODULE = 'Missing plugin: handyman';
const MODULES_ERROR = 'Received sub schema with different modules, may be incompatible: ';
const TRAVERSE_PATH = ['$properties', '$items'];
const entries = v => (v?.constructor?.name === 'Map' ? v.entries() : Object.entries(v));
const copy = sample => (Array.isArray(sample) ? [...sample] : { ...sample });

module.exports = (factory, options) => (schema, tools) => {
  const { build, warn } = tools;
  const namespace = options.namespace ? new Map(entries(options.namespace)) : new Map();
  const [repair, unnamedSchemas] = [new RepairKit(factory, tools, namespace), new Set()];
  tools.build = plan => {
    const fixed = repair(plan);
    const builded = build(fixed);
    const { $id } = builded;
    if (fixed.$calc) builded.$calc = fixed.$calc;
    if (fixed.$type !== 'schema') return builded;
    const [a, b] = [[...factory.modules.keys()], [...builded.modules.keys()]];
    !a.every(key => b.includes(key)) && warn({ cause: MODULES_ERROR + $id, plan, sample: b });
    if (!$id) return unnamedSchemas.add(builded), builded;
    return namespace.set($id, builded), builded;
  };

  schema.pull = name => {
    const schema = namespace.get(name);
    if (schema) return schema;
    for (const [, schema] of [...namespace.entries(), ...unnamedSchemas.entries()]) {
      if (!schema.pull) throw new Error(MISSING_MODULE);
      const found = schema.pull(name);
      if (found) return found;
    }
    return null;
  };

  schema.calculate = (sample, mode) => {
    const calc = schema.$calc;
    var root = mode && typeof sample === 'object' ? copy(sample) : sample;
    if (calc) root = typeof calc === 'function' ? calc(root, root) : calc;
    if (typeof root !== 'object') return root;
    return traverse(root, schema);
    function traverse(parent, schema) {
      const data = mode ? copy(parent) : parent;
      for (const key of TRAVERSE_PATH) {
        const children = schema[key];
        if (!children) continue;
        for (const prop of key === '$properties' ? [...children.keys()] : Object.keys(data)) {
          const schema = children.get?.(prop) ?? children[prop] ?? children[0];
          const calc = schema.$calc;
          if (typeof calc === 'function') data[prop] = calc(data[prop], parent, root);
          else if (calc) data[prop] = calc;
          if (typeof data[prop] === 'object') data[prop] = traverse(data[prop], schema);
        }
      }
      return data;
    }
  };
};
