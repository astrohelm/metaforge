'use strict';

const parser = tools => {
  const parse = (sample, parse) => {
    if (!tools.isInstance(sample) || !sample) return null;
    const properties = tools.getKeys(sample).reduce((acc, key) => {
      acc[key] = parse(tools.getValue(key, sample), parse);
      return acc;
    }, {});
    return { type: 'object', properties };
  };
  return parse;
};

const search = (schema, prop) => {
  if (!schema.properties) return [null, null];
  if (prop in schema.properties) return [schema.properties[prop], null];
  if (!schema.patternProperties) return [null, null];
  const entries = Object.entries(schema.patternProperties);
  if (typeof prop !== 'string') prop = String(prop);
  for (const [pattern, value] of entries) if (prop.match(pattern)) return [value, pattern];
  return [null, null];
};

const process = (get, set, target) => (proto, prop, path) => {
  const { preprocess, postprocess } = proto;
  if (preprocess) set(prop, preprocess(get(prop, target)), target);
  const result = proto.test(get(prop, target), path);
  if (postprocess) set(prop, postprocess(get(prop, target), result), target);
  return result;
};

const buildProps = (ctx, plan, tools) => {
  const requires = new Map();
  const builded = { properties: {}, patternProperties: {} };
  for (const propType in builded) {
    if (!plan[propType]) continue;
    const entries = Object.entries(plan[propType]);
    for (const [key, value] of entries) {
      builded[propType][key] = tools.build(value);
      const required = tools.isRequired(value);
      if (required) requires.set(key);
    }
    ctx[propType] = Object.assign({}, builded[propType]);
  }
  return requires;
};

module.exports = { process, parser, search, buildProps };
