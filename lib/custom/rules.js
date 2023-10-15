'use strict';

const sizeRule = sample => {
  if (sample < 5) return ['Sample size must be greater than 5'];
  if (sample > 100) return ['Sample size must be lesser than 100'];
  return [];
};
