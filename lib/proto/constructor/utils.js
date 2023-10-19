'use strict';

const parseResult = (res, options, cause) => {
  const { sample, path, plan, tools } = options;
  if (typeof res === 'object' && Array.isArray(res)) {
    if (!res.length || res[0] instanceof tools.Error) return res;
    return res.map(v => parseResult(v, options)).flat(2);
  }
  if (typeof res === 'boolean' && !res) return [new tools.Error({ sample, path, plan, cause })];
  if (typeof res === 'string') return [new tools.Error({ sample, path, plan, cause: res })];
  if (res instanceof tools.Error) return [res];
  return [];
};

const setDefault = (ctx, plan, tools) => {
  if (typeof plan.preprocess === 'function') ctx.preprocess = plan.preprocess;
  if (typeof plan.postprocess === 'function') ctx.postprocess = plan.postprocess;
  if (!('required' in ctx)) ctx.required = tools.isRequired(plan);
  if (!ctx.origin) ctx.origin = 'custom';
  if (!ctx.type) ctx.type = 'unknown';
};

module.exports = { parseResult, setDefault };
