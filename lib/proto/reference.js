'use strict';

module.exports = {
  kind: 'struct',
  constructor(definition) {
    const { many, one } = definition;
    const [key, rel, ref] = many ? ['many', 'many-to-one', many] : ['one', 'one-to-many', one];
    this[key] = ref;
    this.type = rel;
    this.root.relations.add({ to: ref, type: rel });
  },
  compare(value, path) {
    const { one, many, root } = this;
    const schema = root.findReference(one ?? many);
    if (one) return schema.compare(value, path);
    for (const obj of value) {
      const errors = schema.compare(obj, path);
      if (errors.length) return errors;
    }
    return [];
  },
};
