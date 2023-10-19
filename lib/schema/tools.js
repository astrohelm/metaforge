'use strict';

const getCondition = (name, max) => {
  let flag = false;
  if (name === 'allof') {
    return (result, i) => {
      if (result.length > 0) return ['break', 'Item did not pass one of schema'];
      if (i === max) return ['skip'];
      return ['continue'];
    };
  }
  if (name === 'oneof') {
    return (result, i) => {
      if (flag && result.length === 0) return ['break', 'Item passed more than one schema'];
      if (result.length === 0) flag = true;
      if (!flag && i === max) return ['break', 'Item did not pass all schemas'];
      if (flag && i === max) return ['skip'];
      return ['continue'];
    };
  }
  return (result, i) => {
    if (result.length !== 0 && i >= max) return ['break', 'Item did not pass all schemas'];
    if (result.length === 0) return ['skip'];
    return ['continue'];
  };
};

const runCondition = (handler, { path, sample, createError, prototypes }) => {
  const errors = [];
  for (let i = 0; i < prototypes.length; ++i) {
    const result = prototypes[i].test(sample, path);
    const [toDo, cause] = handler(result, i);
    if (cause) {
      if (result.length) errors.push(...result);
      else errors.push(createError(cause));
    }
    if (toDo === 'skip' || toDo === 'break') break;
    if (toDo === 'continue') continue;
  }
  return errors;
};

const isShorthand = schema => typeof schema === 'string';
const isRequired = s => (isShorthand(s) ? !s.startsWith('?') : s.required ?? true);
const typeOf = s => {
  if (isShorthand(s)) return [!s.startsWith('?') ? s : s.substring(1)];
  if (Array.isArray(s)) return s;
  if (Array.isArray(s.type)) return s.type;
  return [s.type];
};

const exportMeta = schema => {
  const [entries, meta] = [Object.entries(schema), new Map()];
  for (const [k, v] of entries) {
    if (typeof v === 'function' || k === 'warnings') continue;
    if (typeof v === 'object') {
      if (Array.isArray(v)) meta.set(k, v.map(exportMeta));
      else meta.set(k, exportMeta(v));
      continue;
    }
    meta.set(k, v);
  }
  return meta;
};

module.exports = { getCondition, isRequired, typeOf, isShorthand, exportMeta, runCondition };
