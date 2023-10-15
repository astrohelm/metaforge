'use strict';

module.exports = function TypeStorage(name, prototype) {
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
};
