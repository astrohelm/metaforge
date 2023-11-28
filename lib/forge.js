'use strict';

const { utils: astropack } = require('astropack');
module.exports = Forge;

function Forge() {
  const chains = new Map();
  const [getChain, setChain] = [chains.get.bind(chains), chains.set.bind(chains)];
  const wrappers = { before: [], after: [] };
  const { before, after } = wrappers;
  const get = name => wrappers[name] ?? getChain(name);
  return Object.freeze(Object.assign(chains, { set, melt, get, assign }));
  function set(name, ...prototypes) {
    const protos = prototypes.map(unifyProto);
    if (name in wrappers) return wrappers[name].push(...protos), chains;
    const chain = getChain(name) ?? [];
    return chain.push(...protos), setChain(name, chain);
  }
  function assign(targetName, sourceName, ...prototypes) {
    const [dest, source] = [getChain(targetName) ?? [], getChain(sourceName) ?? []];
    return dest.push(...source, ...prototypes.map(unifyProto)), setChain(targetName, dest);
  }
  function melt(name) {
    const chain = chains.get(name);
    if (!chain) return null;
    return function ForgePrototype(plan, tools) {
      const meta = plan.$meta;
      this.$type = name;
      this.$required = plan.$required ?? true;
      if (plan.$id) this.$id = plan.$id;
      if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
        this.$meta = meta;
        Object.assign(this, meta);
      }
      [...before, ...chain, ...after].forEach(proto => proto.call(this, plan, tools));
      if (!this.$kind) this.$kind = 'unknown';
    };
  }
}

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
