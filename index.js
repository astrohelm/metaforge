'use strict';

const Forge = require('./lib/forge');
const proto = require('./lib/proto');
const { SchemaError, Snitch, entries } = require('./lib/utils');
module.exports = Schema;
module.exports.Schema = Schema;
module.exports.Factory = Factory;
module.exports.modules = require('./modules');
module.exports.default = Schema;

const MODULE_ERR = 'Module already exists: ';
const BUILD_ERR = 'Building error: recieved wrong plan:\n';
function Factory(options = {}) {
  const snitch = new Snitch();
  const { modules = Schema.modules, prototypes = {} } = options;
  const chain = [...entries(proto), ...entries(prototypes)];
  this.warnings = snitch.warnings;
  this.forge = chain.reduce((acc, [name, proto]) => acc.set(name, proto), new Forge());
  this.build = plan => new Schema(plan, options, this);
  this.child = (opts = options) => new Schema(opts === options ? opts : { ...opts, ...options });
  this.modules = entries(modules).reduce((acc, [n, m]) => acc.set(n, m(this, options)), new Map());
  this.register = (name, module) => {
    if (this.modules.has(module)) snitch({ cause: MODULE_ERR, plan: this.modules, sample: module });
    return this.modules.set(name, module(this, options)), this;
  };
}

function Schema(plan, options, { modules, forge } = new Factory(options)) {
  const tools = { Error: SchemaError, build, warn: new Snitch() };
  tools.build = tools.build.bind(null, tools);
  modules.forEach(modifier => void (typeof modifier === 'function' && modifier(this, tools, plan)));
  //? enumerable: false
  this.warnings = tools.warn.warnings;
  this.modules = modules;
  return Object.assign(this, tools.build(plan));
  function build(tools, plan) {
    const Type = forge.melt(plan.$type);
    if (Type) return new Type(plan, tools);
    throw new Error(BUILD_ERR + JSON.stringify(plan));
  }
}
