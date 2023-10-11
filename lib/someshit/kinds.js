'use strict';

const STORED = ['entity', 'registry', 'dictionary', 'journal', 'details', 'relation', 'view'];
const MEMORY = ['struct', 'scalar', 'form', 'projection'];
const KINDS = [...MEMORY, ...STORED];
const SCOPE = ['application', 'global', 'local'];
const STORE = ['persistent', 'memory'];
const ALLOW = ['write', 'append', 'read'];

const projection = (kind, meta, root) => {
  const { scope = 'local', store = 'memory', allow = 'write', schema, fields } = meta;
  if (!schema && !fields) throw new Error('Invalid Projection');
  const parent = root.findReference(schema);
  const definitions = Object.keys(fields).reduce((a, k) => (a[k] = parent.fields[k]), {});
  const metadata = { ...meta, kind, scope, store, allow, parent: schema };
  return { definitions, metadata };
};

const stored = (kind, meta, root) => {
  const { scope = SCOPE[0], store = STORE[0], allow = ALLOW[0] } = meta;
  const metadata = { ...meta, kind, scope, store, allow };
  const definitions = { [root.name ? root.name + 'Id' : 'id']: '?string' };
  return { definitions, metadata };
};

const memory = (kind, meta) => {
  const { scope = 'local', store = 'memory', allow = 'write' } = meta;
  return { metadata: { ...meta, kind, scope, store, allow }, definitions: {} };
};

const kindMeta = (kind, meta = {}, root) => {
  if (kind === 'projection') return projection(kind, meta, root);
  if (STORED.includes(kind)) return stored(kind, meta, root);
  return memory(kind, meta);
};

module.exports = { kindMeta, KINDS, STORED, MEMORY, SCOPE, STORE, ALLOW };
