'use strict';

const ACCEPTED = ['string', 'boolean', 'number', 'bigint'];
const META = { kind: 'scalar', origin: 'default' };
const ERR_ENUM = `Enum doesn't contain this value, enum: `;
const ERR_MISS = 'Type missconfiguration, expected type: ';

const scalar = type => ({
  meta: META,
  parse: Object.assign(() => type, { targets: [type] }),
  construct(plan, { isRequired, Error }) {
    this.required = isRequired(plan);
    this.ts = () => type;
    this.test = (sample, path) => {
      if (typeof sample === type) return [];
      if (sample === undefined && !this.required) return [];
      return [new Error({ path, sample, plan, cause: ERR_MISS + type })];
    };
  },
});

const enumerable = {
  meta: META,
  construct(plan, { isRequired, Error }) {
    this.required = isRequired(plan);
    this.enum = plan.enum?.filter(el => ACCEPTED.includes(typeof el));
    this.ts = () => 'unknown';
    this.test = (sample, path) => {
      if (this.enum.includes(sample)) return [];
      return new Error({ path, sample, plan, cause: ERR_ENUM + this.enum.join(', ') });
    };
  },
};

module.exports = {
  string: scalar('string'),
  bigint: scalar('bigint'),
  number: scalar('number'),
  boolean: scalar('boolean'),
  enum: enumerable,
};
