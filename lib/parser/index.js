'use strict';

const Parser = function (schema, options) {
  const isShorthand = typeof schema === 'string';
  let rootType = isShorthand ? schema : schema.type;
  if (isShorthand) rootType = rootType.substring(1);

  return sample => {};
};
