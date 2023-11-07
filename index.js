'use strict';

const Forge = require('./lib/forge');
const createError = require('./lib/error');
Schema.modules = require('./modules');
module.exports = Schema;

const MODULE_ERROR = 'Module already exists: ';
function Schema(plan, options = {}) {
  const { modules = Schema.modules, errorFormat, prototypes } = options;
  const [SchemaError, warnings] = [createError({ format: errorFormat }), []];
  [this.tools, this.modules] = [{ Error: SchemaError, build, warn }, new Map()];
  const forge = new Forge(this, prototypes);
  this.child = (a = plan, b = options) => new Schema(a, b === options ? b : { ...b, ...options });
  this.register = (name, module) => {
    if (this.modules.has(module)) warn({ cause: MODULE_ERROR, plan: this.modules, sample: module });
    module(this, options, plan), this.modules.set(name);
    return this;
  };

  [this.forge, this.warnings] = [forge, warnings];
  for (const [name, plugin] of modules.entries()) this.register(name, plugin);
  return Object.assign(this, this.tools.build(plan));
  function build(plan) {
    const Type = forge.get(plan.$type);
    if (Type) return new Type(plan);
    throw new Error('Building error: recieved wrong plan:\n' + JSON.stringify(plan));
  }

  function warn(options) {
    const warn = new SchemaError({ path: 'BUILD', ...options });
    return warnings.push(warn), warn;
  }
}
