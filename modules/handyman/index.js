'use strict';

const RepairKit = require('./repairkit');
const MISSING_MODULE = 'Missing plugin: handyman';
const MODULES_ERROR = 'Received sub schema with different modules, may be incompatible: ';
const TRAVERSE_PATH = ['$properties', '$items'];
const entries = v => (v?.constructor?.name === 'Map' ? v.entries() : Object.entries(v));
const copy = sample => (Array.isArray(sample) ? [...sample] : { ...sample });

module.exports = (schema, options) => {
  const namespace = options.namespace ? new Map(entries(options.namespace)) : new Map();
  const [{ tools, modules }, { build, warn }] = [schema, schema.tools];
  const repair = new RepairKit(schema, namespace);
  const unnamedSchemas = new Set();
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

  //TODO(sashapop10): Set problem
  schema.calculate = (sample, mode) => {
    let root = mode && typeof sample === 'object' ? copy(sample) : sample;
    const calc = schema.$calc;
    if (typeof calc === 'function') root = calc(root, root);
    else if (calc) root = calc;
    if (typeof root !== 'object') return root;
    return traverse(root, schema);
    function traverse(parent, schema) {
      const data = mode ? copy(parent) : parent;
      for (const key of TRAVERSE_PATH) {
        if (schema.$type === 'set') continue;
        const children = schema[key];
        if (!children) continue;
        const iterator = key === '$properties' ? [...children.keys()] : Object.keys(data);
        for (const prop of iterator) {
          const schema = children.get?.(prop) ?? children[prop] ?? children[0];
          if (!schema) console.log(schema, prop, iterator);
          const calc = schema.$calc;
          let sample = data[prop];
          if (typeof calc === 'function') sample = data[prop] = calc(sample, parent, root);
          else if (calc) sample = data[prop] = calc;
          if (typeof sample === 'object') data[prop] = traverse(sample, schema);
        }
      }
      return data;
    }
  };

  tools.build = plan => {
    const fixed = repair(plan);
    const builded = build(fixed);
    const { $id } = builded;
    if (fixed.$calc) builded.$calc = fixed.$calc;
    if (fixed.$type !== 'schema') return builded;
    const [a, b] = [[...modules.keys()], [...builded.modules.keys()]];
    !a.every(key => b.includes(key)) && warn({ cause: MODULES_ERROR + $id, plan, sample: b });
    if (!$id) return unnamedSchemas.add(builded), builded;
    return namespace.set($id, builded), builded;
  };
};
