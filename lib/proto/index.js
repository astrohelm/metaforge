'use strict';
const PROTO = {
  ...require('../types/proto/scalars'),
  enum: require('./enum'),
};

const getPrototype = plan => {
  const isShorthand = typeof plan === 'string';
  let type = isShorthand ? plan : plan.type;
  if (isShorthand) type = type.substring(1);
  return PROTO[type](plan);
};

module.exports = { PROTO, getPrototype };
