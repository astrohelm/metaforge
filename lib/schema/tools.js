'use strict';

const conditions = (condition, max) => {
  let flag = false;
  if (condition === 'allof') {
    return (result, i) => {
      if (result.length > 0) return ['break', 'Item did not pass one of schema'];
      if (i === max) return ['skip'];
      return ['continue'];
    };
  }
  if (condition === 'oneof') {
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

const isShorthand = schema => typeof schema === 'string';
const isRequired = s => (isShorthand(s) ? !s.startsWith('?') : s.required ?? true);
const typeOf = s => {
  if (isShorthand(s)) return [!s.startsWith('?') ? s : s.substring(1)];
  if (Array.isArray(s)) return s;
  if (Array.isArray(s.type)) return s.type;
  return [s.type];
};

module.exports = { conditions, isRequired, typeOf, isShorthand };
