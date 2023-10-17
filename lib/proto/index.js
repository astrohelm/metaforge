'use strict';

const INVALID = 'Invalid prototype, missing construct method';
const createType = (proto, defaultMeta) => {
  if (!proto?.construct || typeof proto.construct !== 'function') throw new Error(INVALID);
  const meta = {};
  if (proto.meta) Object.assign(meta, proto.meta);
  if (defaultMeta) Object.assign(meta, defaultMeta);
  function Type(plan, tools) {
    proto.construct.call(this, plan, tools);
    Object.assign(this, meta);
    if (plan.meta) Object.assign(this, plan.meta);
    if (!this.type) this.type = 'unknown';
    if (!this.test) this.test = () => [];
    return Object.freeze(this);
  }
  return Object.assign(Type, meta);
};

module.exports = {
  createType,
  proto: new Map(
    Object.entries({
      ...require('./scalars'),
      ...require('./objects'),
      ...require('./arrays'),
      ...require('./exotic'),
    }),
  ),
};
