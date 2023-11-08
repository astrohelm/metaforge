'use strict';

const { string: astropack } = require('astropack');

const MAX_ITEMS = 5;
const SPECIAL = /[ `!@#%^&*()+\-=[\]{};':"\\|,.<>/?~]/;
const nameFix = name => name.replace(new RegExp(SPECIAL, 'g'), '');
const brackets = (sample, allowSkip) => {
  if (allowSkip) {
    const skip = astropack.case.isFirstLetter(sample) && !SPECIAL.test(sample);
    if (skip) return sample;
  }
  // eslint-disable-next-line quotes
  const sep = sample.includes("'") ? '"' : "'";
  return sep + sample + sep;
};

const jsdoc = (meta, spacing = '') => {
  let result = spacing + '/**\n';
  for (const key in meta) {
    if (key[0] !== '@') continue;
    result += spacing + ` * ${key} ${meta[key]}\n`;
  }
  return result + spacing + ' */\n';
};

module.exports = { nameFix, brackets, MAX_ITEMS, jsdoc };
