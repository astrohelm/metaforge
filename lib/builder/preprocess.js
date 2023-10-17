'use strict';

const path = 'PREPROCESS';
const { string } = require('astropack');
const { typeOf, isShorthand } = require('../schema/tools');

module.exports = ({ types, namespace }, tools, schema) => {
  const [prototypes, { warn }] = [[], tools];
  const signal = (cause, sample, sampleType) => warn({ sample, sampleType, path, cause });
  for (const type of typeOf(schema)) {
    if (string.case.isFirstUpper(type)) {
      const prototype = namespace.get(type);
      if (prototype && prototype.test) prototypes.push(prototype);
      else signal('Missing or wrong schema at namespace', namespace, type);
      continue;
    }
    const Type = types.get(type);
    if (!Type) {
      signal('Missing prototype', schema, type);
      continue;
    }
    if (Type.kind !== 'scalar' && isShorthand(schema)) {
      signal('Shorthand usage with non-scalar schema', schema, type);
      continue;
    }
    const prototype = new Type(schema, tools);
    prototypes.push(prototype);
  }
  return prototypes;
};

// sql, input, runtime check, core, rpc protocol
