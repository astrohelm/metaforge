'use strict';

const extractSchema = def => {
  if (def?.constructor?.name === 'Schema') return def;
  if (def.schema?.constructor?.name === 'Schema') return def.schema;
  return null;
};

module.exports = { extractSchema };
