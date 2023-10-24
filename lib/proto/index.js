'use strict';

const createType = require('./constructor');
const prototypes = Object.entries({
  ...require('./scalars'),
  ...require('./objects/index.js'),
  ...require('./arrays'),
  ...require('./exotic'),
});

module.exports = {
  createType,
  defaultPrototypes: new Map(prototypes),
  defaultTypes: new Map(prototypes.map(([k, v]) => [k, createType(k, v)])),
};
