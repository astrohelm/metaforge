'use strict';

const types = require('./types');

module.exports = schema => {
  function TypescriptWrapper() {
    this.toTypescript = () => 'unknown';
  }
  for (const [name, proto] of types.entries()) schema.forge.attach(name, proto);
  schema.forge.attach('before', TypescriptWrapper);
};
