'use strict';

module.exports = schema => {
  schema.calc = (sample, mode) => {
    if (typeof sample !== 'object') throw new Error('sample must be an object');
    const root = { input: sample };
    return traverse(root).input;
    function traverse(root, plan) {
      const data = mode ? { ...root } : root;
      for (const key in data) {
        const [sample, type] = [data[key], plan[key]];
        if (!type) continue;
        if (typeof sample === 'function') data[key] = sample(data, root);
        if (typeof sample === 'object') data[key] = traverse(sample, plan);
      }
      return data;
    }
  };
};
