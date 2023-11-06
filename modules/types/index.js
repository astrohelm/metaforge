'use strict';

const { nameFix } = require('./utils');
const types = require('./types');

module.exports = schema => {
  for (const [name, proto] of types.entries()) schema.forge.attach(name, proto);
  schema.forge.attach('before', { toTypescript: () => 'unknown' });
  schema.forge.attach('after', function TypescriptWrapper() {
    const compile = this.toTypescript;
    this.toTypescript = (name, namespace) => compile(nameFix(name), namespace);
  });

  schema.dts = (name = 'MetaForge', options = {}) => {
    const mode = options.mode ?? 'mjs';
    if (name !== nameFix(name)) throw new Error('Invalid name format');
    const namespace = { definitions: new Set(), exports: new Set() };
    const type = schema.toTypescript(name, namespace);
    if (type !== name) {
      if (namespace.exports.size === 1) {
        const definitions = Array.from(namespace.definitions).join('');
        if (mode === 'cjs') return definitions + `export = ${type}`;
        return definitions + `export type ${name}=${type};export default ${type};`;
      }
      namespace.definitions.add(`type ${name}=${type};`);
    }
    namespace.exports.add(name);
    const definitions = Array.from(namespace.definitions).join('');
    if (mode === 'cjs') return definitions + `export = ${name};`;
    const exports = `export type{${Array.from(namespace.exports).join(',')}};`;
    return definitions + exports + `export default ${name};`;
  };
};
