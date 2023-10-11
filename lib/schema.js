'use strict';

function Schema(name, source, namespaces = []) {
  this.namespaces = new Set(namespaces);
  this.toInterface = () => {
    const types = [];
    types.push(`interface ${name} {`);
  };

  this.attach = (...namespaces) => namespaces.forEach(ns => this.namespaces.add(ns));
  this.detouch = (...namespaces) => namespaces.forEach(ns => this.namespaces.delete(ns));
  this.toString = () => JSON.stringify(fields, (k, v) => (k === 'root' ? undefined : v));
  this.toJSON = () => {
    const { root, ...rest } = fields;
    return root, rest;
  };
}
