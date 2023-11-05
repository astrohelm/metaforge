'use strict';

const RepairKit = require('./repairkit');
const MISSING_MODULE = 'Missing plugin: handyman';
const MODULES_ERROR = 'Recieved sub schema with different modules, may be incompatible: ';
const entries = v => (v?.constructor?.name === 'Map' ? v.entries() : Object.entries(v));

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

  tools.build = plan => {
    const fixed = repair(plan);
    const builded = build(fixed);
    const { $id } = builded;
    if (fixed.$type !== 'schema') return builded;
    const [a, b] = [[...modules.keys()], [...builded.modules.keys()]];
    !a.every(key => b.includes(key)) && warn({ cause: MODULES_ERROR + $id, plan, sample: b });
    if (!$id) return unnamedSchemas.add(builded), builded;
    return namespace.set($id, builded), builded;
  };
};
