'use strict';

const schemaFrom = require('./from');
const prototypes = require('../proto');

//TODO Type fabric, to fix existed and passed types
//TODO Parser that creates test for Schema, append Models, and tests it for errors
const Schema = function (plan, options = {}) {
  const { namespace, types, rules } = options;

  this.plan = plan;
  this.test = sample => {
    const isShorthand = typeof plan === 'string';
    let planType = isShorthand ? plan : plan.type;
    if (isShorthand) {
      if (planType[0] === '?') planType = planType.substring(1);
      const errors = prototypes[planType](sample);
    }

    const result = { valid: true, errors: [] };
    return result;
  };
};

module.exports = Schema;
module.exports.from = sample => new Schema(schemaFrom(sample));
