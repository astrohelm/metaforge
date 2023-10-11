module.exports = {
  kind: 'struct',
  construct(definition, parser) {
    const tuple = definition.value || definition.tuple;
    this.value = tuple.map(el => {
      const [name, scalar] = typeof el === 'string' ? Object.entries(el)[0] : [null, el];
      const { Type, definitions } = parser.parse(scalar);
      if (!Type || Type.kind !== 'scalar') {
        throw new TypeError(`Type ${scalar} is not a scalar`);
      }
      const type = new Type(definitions, parser);
      if (name) type.name = name;
    });
  },
};
