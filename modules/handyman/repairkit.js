'use strict';

const { string: astropack } = require('astropack');
const unknown = { $type: 'unknown', $required: false };
const SCHEMA_NOT_FOUND = 'Schema not found: ';
const TYPE_NOT_FOUND = 'Received unknown type: ';
const ARRAY_TYPE_NOT_FOUND = 'Cant parse type of received array: ';
module.exports = function RepairKit(schema, namespace) {
  const shorthands = { string, object, array, function: func };
  const { tools, forge, child } = schema;
  return repair;

  function repair(plan, warn = tools.warn) {
    const type = Array.isArray(plan) ? 'array' : typeof plan;
    return shorthands[type]?.(plan, warn) ?? unknown;
  }

  function string(plan, warn) {
    const $required = plan[0] !== '?';
    const $type = $required ? plan : plan.slice(1);
    if (!astropack.case.isFirstUpper(plan)) {
      if (forge.has($type)) return { $type, $required };
      warn({ cause: TYPE_NOT_FOUND + $type, plan, sample: $type });
      return unknown;
    }
    const schema = namespace.get($type); //? Schema wrapper #1
    if (schema) return { $type: 'schema', schema, $id: $type, $required };
    warn({ cause: SCHEMA_NOT_FOUND + $type, plan, sample: $type });
    return unknown;
  }

  function array(plan, warn) {
    let isArray = true;
    const stub = () => (isArray = false);
    for (let i = 0; i < plan.length && isArray; ++i) {
      const fixed = repair(plan[i], stub);
      isArray = isArray && forge.has(fixed.$type);
      if (!isArray) break;
    }
    if (isArray) return { $type: 'array', items: plan, $required: true };
    const isEnum = plan.every(item => typeof item === 'string' || typeof item === 'number');
    if (isEnum) return { $type: 'enum', enum: plan, $required: true };
    warn({ cause: ARRAY_TYPE_NOT_FOUND, sample: plan, plan });
    return unknown;
  }

  function object(plan, warn) {
    if (typeof plan.$calc === 'function') return func(plan, warn);
    const { $required = true, $id, ...fields } = plan; //? Schema wrapper #2
    if (plan.constructor.name === 'Schema') return { $type: 'schema', schema: plan, $required };
    if (!plan || plan.constructor.name !== 'Object') return unknown;
    if ($id) return { $type: 'schema', $id, schema: child(fields), $required };
    if ('$type' in plan) {
      if (forge.has(plan.$type)) return '$required' in plan ? plan : { ...plan, $required };
      warn({ cause: TYPE_NOT_FOUND + plan.$type, sample: plan.$type, plan });
      return unknown;
    }
    const { $meta, ...other } = fields;
    const result = { $type: 'object', properties: { ...other }, $required };
    if ($meta) result.$meta = $meta;
    return result;
  }

  function func(plan, warn) {
    if (typeof plan === 'function') return { $type: 'unknown', $calc: plan };
    const { $calc, ...fields } = plan;
    const type = repair(fields, warn);
    if (type.$type === 'set' || type.$type === 'map') return type;
    return { ...repair(fields, warn), $calc };
  }
};
