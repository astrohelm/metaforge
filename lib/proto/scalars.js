'use strict';

const MISS = 'Type missconfiguration, expected type: ';
const scalar = type => ({
  meta: { kind: 'scalar', subtype: 'default' },
  construct(plan, tools) {
    const { isRequired, Error } = tools;
    [this.type, this.required] = [type, isRequired(plan)];
    this.ts = () => type;
    this.test = (sample, path) => {
      if (typeof sample === type) return [];
      if (sample === undefined && !this.required) return [];
      return [new Error({ path, sample, plan, cause: MISS + type })];
    };
  },
});

module.exports = {
  string: scalar('string'),
  bigint: scalar('bigint'),
  number: scalar('number'),
  boolean: scalar('boolean'),
};
