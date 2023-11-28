'use strict';

const { brackets, jsdoc } = require('./utils');

const create = type => {
  const notRequiredType = `(${type}|undefined)`;
  return function Scalar() {
    this.toTypescript = () => (this.$required ? type : notRequiredType);
  };
};

module.exports = new Map(
  Object.entries({
    null: create('null'),
    unknown: create('unknown'),
    boolean: create('boolean'),
    string: create('string'),
    number: create('number'),
    bigint: create('bigint'),
    any: create('any'),
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

function Enumerable() {
  this.toTypescript = () => {
    const or = i => (this.$enum.length - 1 === i ? '' : '|');
    const type = this.$enum.reduce((acc, s, i) => acc + brackets(s, false) + or(i), '');
    return '(' + type + ')';
  };
}

function Iterable() {
  this.toTypescript = (name, namespace) => {
    let type;
    const builded = this.$items.map((item, i) => item.toTypescript(`${name}_${i}`, namespace));
    if (this.$type === 'set') type = `Set<${builded.join('|')}>`;
    else if (this.$isTuple) type = `[${builded.join(',')}]`;
    else type = `(${builded.join('|')})[]`;
    return type;
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
    return '(' + type + ')';
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
