'use strict';

const create = type => ({ toTypescript: () => type });
module.exports = new Map(
  Object.entries({
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
    object: Struct,
    record: Struct,
    map: Struct,
  }),
);

function Enumerable() {
  this.toTypescript = () => `(${this.$enum.join(' | ')})`;
}

function Iterable() {
  this.toTypescipt = () => {
    const builded = this.$items.map(item => item.toTypescript());
    if (this.$type === 'set') return `Set<${builded.join(' | ')}>`;
    if (this.$isTuple) return `[${builded.join(', ')}]`;
    return `(${builded.join(' | ')})[]`;
  };
}

function Struct() {
  const patterns = this.$patterns.entries();
  this.toTypescript = () => {
    let result = '{ ';
    for (const [key, value] in this.$properties.entries()) {
      // eslint-disable-next-line quotes, no-extra-parens
      const sep = key.includes('`') ? (key.includes('"') ? "'" : '"') : '`';
      result += `${sep + key + sep}${value.$required ? '?' : ''}: ${value.toTypescript()}, `;
    }
    if (!patterns.length) return result + '}';
    const types = patterns.map((_, value) => value.toTypescript());
    return result + `[key: string]?: ${types.join(' | ')}, }`;
  };
}

function Union() {
  const sep = this.$condition === 'allof' ? ' & ' : ' | ';
  this.toTypescript = () => this.$types.map(type => type.toTypescript()).join(sep);
}
