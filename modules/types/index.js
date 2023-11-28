'use strict';

const { nameFix, jsdoc } = require('./utils');
const types = require('./types');

module.exports = ({ forge }) => {
  for (var [name, proto] of types.entries()) forge.set(name, proto);
  forge.set('before', { toTypescript: () => 'unknown' });
  forge.set('after', function TypescriptWrapper() {
    const compile = this.toTypescript;
    this.toTypescript = (name, namespace) => compile(nameFix(name), namespace);
  });

  return schema => {
    schema.dts = (name = 'MetaForge', options = {}) => {
      if (name !== nameFix(name)) throw new Error('Invalid name format');
      const namespace = { definitions: new Set(), exports: new Set() };
      const type = schema.toTypescript(name, namespace);
      const exportMode = options.export?.mode ?? 'all';
      const exportType = options.export?.type ?? 'mjs';
      namespace.exports.add(name);
      if (type !== name) {
        const meta = schema.$meta;
        namespace.definitions.add(`${meta ? jsdoc(meta) : ''}type ${name} = ${type};`);
      }
      let result = Array.from(namespace.definitions).join('\n\n');
      if (exportMode === 'no') return result;
      if (exportMode !== 'default-only' && exportType === 'mjs') {
        result += `\nexport type { ${Array.from(namespace.exports).join(', ')} };`;
      }
      if (exportMode !== 'exports-only') {
        if (exportType === 'mjs') return result + `\nexport default ${name};`;
        return result + `\nexport = ${name};`;
      }
      return result;
    };
  };
};
