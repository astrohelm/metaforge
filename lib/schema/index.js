'use strict';

const arrayBuilder = (schema, { build }) => schema.items.map(v => build(v));
const [objectBuilder, createError] = [require('./object'), require('./error')];
const builders = { object: objectBuilder, array: arrayBuilder };
const tooling = { Error: createError(), ...require('./utils'), builders };
const build = require('./build');

module.exports = function Schema(schema, { errorPattern, ...options }) {
  const tools = { ...tooling, build: null, warn: null };
  if (errorPattern) tools.Error = createError({ pattern: errorPattern });
  const warn = options => {
    const err = new tooling.Error(options);
    return this.warnings.push(err), err;
  };

  [tools.build, tools.warn] = [build.bind(null, options, tools), warn];

  this.warnings = [];
  this.test = tools.build(schema);
  return Object.freeze(this);
};

// schema check, dts generation,
