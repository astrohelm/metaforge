'use strict';

const [build, createError] = [require('../builder'), require('./error')];
const { proto: prepared, createType } = require('../proto');
const tooling = { Error: createError(), ...require('./tools') };

module.exports = function Schema(schema, params = {}) {
  const { errorPattern, types: custom = new Map(), ...options } = params;
  const [types, customPrototypes] = [new Map(), custom.entries()];
  const tools = { ...tooling, build: null, warn: null };
  tools.build = build.bind(null, { types, ...options }, tools);
  tools.warn = options => {
    const err = new tooling.Error(options);
    return this.warnings.push(err), err;
  };

  if (errorPattern) tools.Error = createError({ pattern: errorPattern });
  for (const [name, proto] of customPrototypes) {
    const prototype = prepared.get(name) ?? proto;
    types.set(name, createType(prototype, proto.meta));
  }
  for (const [name, proto] of prepared) {
    if (types.has(name)) continue;
    types.set(name, createType(proto));
  }

  this.warnings = [];
  Object.freeze(tools);
  Object.assign(this, tools.build(schema));
  return Object.freeze(this);
};
// this.update = schema => new Schema(schema,)
