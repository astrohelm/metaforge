'use strict';

const path = 'PREPROCESS';
const { string: astropack } = require('astropack');
const { typeOf, isShorthand } = require('../schema/tools');
const ERR_SHORTHAND = 'Shorthand usage with non-scalar schema';
const ERR_MISSING_PROTO = 'Missing prototype';
const ERR_MISSING_SCHEMA = 'Missing or wrong schema at namespace';

module.exports = ({ types, namespace }, tools, schema) => {
  const [prototypes, { warn }] = [[], tools];
  const signal = (cause, sample, sampleType) => warn({ sample, sampleType, path, cause });
  for (const type of typeOf(schema)) {
    if (astropack.case.isFirstUpper(type)) {
      const prototype = namespace.get(type);
      if (prototype && prototype.test) prototypes.push(prototype);
      else signal(ERR_MISSING_SCHEMA, namespace, type);
      continue;
    }
    const Type = types.get(type);
    if (!Type || ((Type.kind !== 'scalar' || type === 'enum') && isShorthand(schema))) {
      if (!Type) signal(ERR_MISSING_PROTO, schema, type);
      else signal(ERR_SHORTHAND, schema, type);
      continue;
    }
    const prototype = new Type(schema, tools);
    prototypes.push(prototype);
  }
  return prototypes;
};
