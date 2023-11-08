'use strict';

const { nameFix, jsdoc } = require('./utils');
const types = require('./types');

module.exports = schema => {
  for (const [name, proto] of types.entries()) schema.forge.attach(name, proto);
  schema.forge.attach('before', { toTypescript: () => 'unknown' });
  schema.forge.attach('after', function TypescriptWrapper() {
    const compile = this.toTypescript;
    this.toTypescript = (name, namespace) => compile(nameFix(name), namespace);
  });

  schema.dts = (name = 'MetaForge', options = {}) => {
    const [exportMode, exportType] = [options.export?.mode ?? 'all', options.export?.type ?? 'mjs'];
    if (name !== nameFix(name)) throw new Error('Invalid name format');
    const namespace = { definitions: new Set(), exports: new Set() };
    const type = schema.toTypescript(name, namespace);
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
