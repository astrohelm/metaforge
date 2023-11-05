'use strict';

module.exports = new Map(
  Object.entries({
    handyman: require('./handyman'),
    metatype: require('./types'),
    metatest: require('./test'),
  }),
);
