'use strict';

const { extractSchema } = require('../utils');

module.exports = root => {
  const { schema, tuple } = root.types;
  const parsers = {
    schema: source => {
      const schema = extractSchema(source);
      if (!schema) return null;
      root.update(schema);
      return { Type: root.types.schema, defs: { schema: schema.fields } };
    },
    string: source => ({}),
    kind: source => parsers.longType({ type: source }),
    kindless: source => ({ Type: schema, defs: { schema: source }, meta: { kind: 'struct' } }),
    tuple: source => ({ Type: tuple, defs: { value: source } }),
    function: () => ({}),
  };

  return {
    array: [parsers.tuple],
    string: [parsers.string],
    object: [parsers.schema, parsers.kind, parsers.kindless],
    function: [parsers.function],
  };
};
