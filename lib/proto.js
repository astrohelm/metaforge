'use strict';

const create = type => ({ $kind: type });
module.exports = new Map(
  Object.entries({
    unknown: create('unknown'),
    boolean: create('scalar'),
    string: create('scalar'),
    number: create('scalar'),
    bigint: create('scalar'),
    any: create('any'),
    schema: Schema,
    union: Union,
    array: List,
    tuple: List,
    set: List,
    record: Struct,
    object: Struct,
    map: Struct,
    enum: Enum,
  }),
);

const ENUM_WARN = 'Recieved incorrect enumerable';
function Enum(plan, { warn }) {
  this.$kind = 'enum';
  const filter = el => typeof el === 'string' || typeof el === 'number';
  this.$enum = Array.isArray(plan.enum) ? [...new Set(plan.enum)].filter(filter) : [];
  const isFiltered = this.$enum.length !== plan.enum?.length;
  isFiltered && warn({ cause: ENUM_WARN, plan, sample: plan.enum });
}

const ITEMS_ERROR = 'Plan items are invalid or empty';
function List(plan, { warn, build }) {
  this.$kind = 'struct';
  const isArray = Array.isArray(plan.items);
  this.$isTuple = this.$type === 'tuple' || isArray;
  this.$items = (isArray ? plan.items : [plan.items]).map(build);
  !this.$items.length && warn({ plan, cause: ITEMS_ERROR, sample: plan.items });
}

const PLANS_ERROR = 'Revievd plan without properties';
function Struct(plan, { build, warn }) {
  [this.$kind, this.$properties, this.$patterns] = ['struct', new Map(), new Map()];
  this.$isRecord = this.$type === 'record' || plan.isRecord;
  this.$requires = [];
  !plan.properties && warn({ plan, sample: plan.properties, cause: PLANS_ERROR });
  for (const [key, value] of Object.entries(plan.properties ?? {})) {
    const builded = build(value);
    builded.$required && this.$requires.push(key);
    (value.isPattern ? this.$patterns : this.$properties).set(key, builded);
  }
}

function Union(plan, { build }) {
  this.$kind = 'union';
  this.$condition = plan.condition ?? 'anyof';
  this.$types = (Array.isArray(plan.types) ? plan.types : [plan]).map(build);
}

function Schema(plan) {
  Object.assign(this, plan.schema);
  if (plan.$id) this.$id = plan.$id;
  this.$required = plan.$required;
}
