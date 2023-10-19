'use strict';

const [build, createError] = [require('../builder'), require('./error')];
const { defaultTypes, deffaultPrototypes, createType } = require('../proto');
const tooling = { Error: createError(), ...require('./tools') };
const { ParseStorage, createParser } = require('../parser');

function Schema(plan, params = {}) {
  if (plan instanceof Schema) return plan.child(null, params); //? Just updating parameters
  const { errorFormat, types: custom, namespace = new Map() } = params;
  const tools = { ...tooling, build: null, warn: null };
  const types = new Map([...defaultTypes]); //? Copy default types links
  tools.build = build.bind(null, { types, namespace }, tools);
  tools.warn = options => {
    const err = new tooling.Error(options);
    return this.warnings.push(err), err;
  };

  if (errorFormat) tools.Error = createError({ format: errorFormat });
  if (custom && custom instanceof Map) {
    const entries = custom.entries();
    for (const [name, proto] of entries) {
      const prototype = deffaultPrototypes.get(name) ?? proto;
      types.set(name, createType(name, prototype, proto.meta));
    }
  }

  this.warnings = [];
  Object.freeze(tools);
  Object.defineProperty(this, 'meta', { get: tools.exportMeta.bind(null, this) });
  this.parse = createParser(new ParseStorage(types));
  this.child = (p, o) => new Schema(p || plan, o ? { ...params, ...o } : params);
  if (plan) Object.assign(this, tools.build(plan)); //? Gathering test, ts methods and metadata
  return Object.freeze(this);
}

Schema.parse = createParser(new ParseStorage(defaultTypes));
Schema.from = (plan, params) => new Schema(plan, params);
module.exports = Schema;
