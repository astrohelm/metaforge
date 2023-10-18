'use strict';

const STANDARD = ['string', 'number', 'bigint', 'boolean', 'object', 'array'];
function TypedParseStorage(name, prototype) {
  const handlers = new Map();
  this.toJSON = () => handlers;
  this.toString = () => JSON.stringify(handlers);
  this[Symbol.iterator] = function* () {
    yield* handlers.entries();
    yield [name, prototype];
  };

  return new Proxy(this, {
    ownKeys: () => handlers.keys(),
    has: (_, prop) => handlers.has(prop),
    set: (_, prop, value) => handlers.set(prop, value),
    deleteProperty: (_, prop) => handlers.delete(prop),
    get: (target, prop) => {
      if (prop === Symbol.iterator) return this[Symbol.iterator].bind(target);
      return handlers.get(prop);
    },
  });
}

module.exports = function ParseStorage(argTypes) {
  const types = new Map([...argTypes]);
  const store = STANDARD.reduce((acc, name) => {
    acc[name] = new TypedParseStorage(name, types.get(name).parse);
    types.delete(name);
    return acc;
  }, {});

  for (const [name, Type] of types.entries()) {
    if (!Type.parse) continue;
    for (const type of Type.parse.targets) store[name][type] = Type.parse;
  }

  return types.clear(), Object.freeze(Object.assign(this, store));
};
