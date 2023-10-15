'use strict';

module.exports = builder => schema => {
  const builded = { properties: {}, patternProperties: {} };
  const requires = new Map();

  for (const propType in builded) {
    if (!schema[propType]) continue;
    const entries = Object.entries(schema[propType]);
    for (const [key, value] of entries) {
      builded[propType][key] = builder.build(value);
      const required = builder.isRequired(value);
      if (required) requires.set(key);
    }
  }

  const search = prop => {
    if (prop in builded.properties) return [builded.properties[prop], null];
    const entries = Object.entries(builded.patternProperties);
    if (typeof prop !== 'string') prop = String(prop);
    for (const [pattern, value] of entries) if (prop.match(pattern)) return [value, pattern];
    return [null, null];
  };

  return { search, required: requires };
};
