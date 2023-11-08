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

const { brackets, MAX_ITEMS, jsdoc } = require('./utils');
function Scalar() {
  this.toTypescript = () => (this.$required ? this.$type : `(${this.$type}|undefined)`);
}

function Enumerable() {
  this.toTypescript = (name, namespace) => {
    const or = i => (this.$enum.length - 1 === i ? '' : '|');
    const type = this.$enum.reduce((acc, s, i) => acc + brackets(s, false) + or(i), '');
    if (this.$enum.length < MAX_ITEMS) return '(' + type + ')';
    namespace.definitions.add(`type ${name} = ${type};`);
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
    namespace.definitions.add(`type ${name} = ${type};`);
    return name;
  };
}

const SPACING = '  ';
function Struct() {
  this.toTypescript = (name, namespace) => {
    const rootMeta = this.$meta;
    let result = `interface ${name} {\n`;
    if (rootMeta) result = jsdoc(rootMeta) + result;
    for (const [key, proto] of this.$properties.entries()) {
      const type = proto.toTypescript(`${name}_${key}`, namespace);
      if (proto.$meta) result += jsdoc(proto.$meta, SPACING);
      result += `${SPACING + brackets(key, true) + (proto.$required ? '' : '?')}: ${type};\n`;
    }
    namespace.definitions.add(result + '};' + (rootMeta ? '\n' : ''));
    return name;
  };
}

function Union() {
  this.toTypescript = (name, namespace) => {
    const types = this.$types.map((type, i) => type.toTypescript(`${name}_${i}`, namespace));
    const type = types.join(this.$condition === 'allof' ? '&' : '|');
    if (types.length < MAX_ITEMS) return '(' + type + ')';
    namespace.definitions.add(`type ${name} = ${type};`);
    return name;
  };
}

function Schema() {
  const compile = this.toTypescript;
  this.toTypescript = (name, namespace) => {
    const id = this.$id ?? name;
    const type = compile(id, namespace);
    if (!this.$id) return type;
    if (type !== id) namespace.definitions.add(`type ${id} = ${type};`);
    namespace.exports.add(id);
    return id;
  };
}
