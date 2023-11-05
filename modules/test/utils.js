'use strict';

module.exports = { unionHandler, instanceOfArray, objectEntries, unifyResult };

function objectEntries(t, s) {
  if ((t === 'map' || t === 'any') && s?.constructor?.name === 'Map') return s.entries();
  if (typeof s === 'object') return Object.entries(s);
  return null;
}

function instanceOfArray(type, sample) {
  if (type === 'array') return Array.isArray(sample);
  return sample?.constructor?.name === 'Set';
}

function unifyResult(result, createError) {
  const flatResult = [];
  const unify = v => {
    if (typeof v === 'boolean' && !v) return void flatResult.push(createError());
    if (!v) return void 0;
    if (Array.isArray(v)) return void v.forEach(unify);
    if (typeof v === 'string') return void flatResult.push(createError(v));
    if (typeof v === 'object') return void flatResult.push(v);
    return void 0;
  };
  return unify(result), flatResult;
}

function unionHandler(name, max) {
  let flag = false;
  if (name === 'allof') {
    return (result, i) => {
      if (result.length > 0) return ['Item did not pass one of schema', result];
      if (i === max) return ['ok'];
      return ['continue'];
    };
  }
  const errors = [];
  if (name === 'oneof') {
    return (result, i) => {
      if (flag && result.length === 0) return ['Item passed more than one schema'];
      if (result.length === 0) flag = true;
      else if (!flag) errors.push(...result);
      if (!flag && i === max) return ['Item did not pass all schemas', errors];
      if (flag && i === max) return ['ok'];
      return ['continue'];
    };
  }
  return (result, i) => {
    if (result.length !== 0) {
      if (i >= max) return ['Item did not pass all schemas', errors];
      errors.push(...result);
    }
    if (result.length === 0) return ['ok'];
    return ['continue'];
  };
}
