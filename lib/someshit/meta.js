'use strict';

const { kindMeta } = require('./kinds');
const OPTIONS = ['validate', 'parse', 'serialize'];

function Meta() {
  const [ref, rel] = [new Set(), new Set()];
}
