'use strict';

const { utils: astropack } = require('astropack');
const core = require('./proto');

module.exports = function Forge(schema, custom = {}) {
  const [chains, wrappers] = [new Map(), { before: [], after: [] }];
  const { before, after } = wrappers;
  this.has = name => chains.has(name);
  this.attach = (name, ...prototypes) => {
    const protos = prototypes.map(unifyProto);
    if (name in wrappers) return void wrappers[name].push(...protos);
    const chain = chains.get(name) ?? [];
    chain.push(...protos), chains.set(name, chain);
    return void 0;
  };

  this.get = name => {
    const chain = chains.get(name);
    if (!chain) return null;
    return function ForgePrototype(plan) {
      const meta = plan.$meta;
      if (plan.$id) this.$id = plan.$id;
      [this.$required, this.$type] = [plan.$required ?? true, name];
      if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
        this.$meta = meta;
        Object.assign(this, meta);
      }
      [...before, ...chain, ...after].forEach(proto => proto.call(this, plan, schema.tools));
      if (!this.$kind) this.$kind = 'unknown';
    };
  };

  for (const [name, proto] of [...entries(core), ...entries(custom)]) this.attach(name, proto);
  return Object.freeze(this);
};

function unifyProto(Proto) {
  const type = astropack.isFunction(Proto);
  if (type === 'function') return Proto;
  return function Prototype(plan, tools) {
    // eslint-disable-next-line new-cap
    if (type === 'arrow') Object.assign(this, Proto(plan, tools));
    if (type === 'class') Object.assign(this, new Proto(plan, tools));
    if (typeof Proto.construct !== 'function') Object.assign(this, Proto);
    else Object.assign(this, Proto.construct(plan, tools));
  };
}

function entries(protos) {
  if (Array.isArray(protos) && protos[0]?.length === 2) return protos;
  return protos?.constructor.name === 'Map' ? protos.entries() : Object.entries(protos);
}
