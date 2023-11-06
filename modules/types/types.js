'use strict';

module.exports = new Map(
  Object.entries({
    unknown: Scalar,
    boolean: Scalar,
    string: Scalar,
    number: Scalar,
    bigint: Scalar,
    any: Scalar,
    enum: Enumerable,
    union: Union,
    array: Iterable,
    tuple: Iterable,
    set: Iterable,
    schema: Schema,
    object: Struct,
    record: Struct,
    map: Struct,
  }),
);

const { brackets, MAX_ITEMS } = require('./utils');
function Scalar() {
  this.toTypescript = () => (this.$required ? this.$type : `(${this.$type}|null|undefined)`);
}

function Enumerable() {
  this.toTypescript = (name, namespace) => {
    const or = i => (this.$enum.length - 1 === i ? '' : '|');
    const type = this.$enum.reduce((acc, s, i) => acc + brackets(s, false) + or(i), '');
    if (this.$enum.length < MAX_ITEMS) return '(' + type + ')';
    namespace.definitions.add(`type ${name}=${type};`);
    return name;
  };
}

function Iterable() {
  this.toTypescript = (name, namespace) => {
    let type;
    const builded = this.$items.map((item, i) => item.toTypescript(`${name}_${i}`, namespace));
    if (this.$type === 'set') type = `Set<${builded.join('|')}>`;
    else if (this.$isTuple) type = `[${builded.join(',')}]`;
    else type = `(${builded.join('|')})[]`;
    if (builded.length < MAX_ITEMS) return type;
    namespace.definitions.add(`type ${name}=${type};`);
    return name;
  };
}

function Struct() {
  this.toTypescript = (name, namespace) => {
    let result = `interface ${name}{`;
    for (const [key, proto] of this.$properties.entries()) {
      const type = proto.toTypescript(`${name}_${key}`, namespace);
      result += `${brackets(key, true) + (proto.$required ? '' : '?')}:${type};`;
    }
    namespace.definitions.add(result + '};');
    return name;
  };
}

function Union() {
  this.toTypescript = (name, namespace) => {
    const types = this.$types.map((type, i) => type.toTypescript(`${name}_${i}`, namespace));
    const type = types.join(this.$condition === 'allof' ? '&' : '|');
    if (types.length < MAX_ITEMS) return '(' + type + ')';
    namespace.definitions.add(`type ${name}=${type};`);
    return name;
  };
}

function Schema() {
  const compile = this.toTypescript;
  this.toTypescript = (name, namespace) => {
    const id = this.$id ?? name;
    const type = compile(id, namespace);
    if (!this.$id) return type;
    if (type !== id) namespace.definitions.add(`type ${id}=${type};`);
    namespace.exports.add(id);
    return id;
  };
}
