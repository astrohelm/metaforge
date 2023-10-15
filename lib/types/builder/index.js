'use strict';

const objectBuilder = require('./object');
const arrayBuilder = builder => schema => schema.items.map(builder.build);

const Builder = function (types) {
  const isShorthand = schema => typeof schema === 'string';
  const isRequired = s => (isShorthand(s) ? !s.startsWith('?') : s.required);
  const typeOf = s => {
    if (isShorthand(s)) return !s.startsWith('?') ? s : s.substring(1);
    return s.type;
  };

  const build = schema => {
    const type = typeOf(schema);
    const prototype = types[type];
    if (!prototype) return () => [`[BUILD] Missing prototype: ${prototype}`];
    return prototype.build(schema, this);
  };

  this.builders = { object: objectBuilder(this), array: arrayBuilder(this) };
  [this.build, this.isRequired] = [build, isRequired];
};

module.exports = Builder;
