/* eslint-disable quotes */
'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('../../');

const generate = (type, name) => new Schema(type).dts(name);
const base = 'type MetaForge=';
const exp = 'export type{MetaForge};export default MetaForge;';
test('[DTS] Basic', () => {
  assert.strictEqual(generate({ $type: 'string' }), base + 'string;' + exp);
  assert.strictEqual(generate('number'), base + 'number;' + exp);
  assert.strictEqual(generate('bigint'), base + 'bigint;' + exp);
  assert.strictEqual(generate('boolean'), base + 'boolean;' + exp);
  assert.strictEqual(generate('unknown'), base + 'unknown;' + exp);
  assert.strictEqual(generate('?any'), base + '(any|null|undefined);' + exp);
});

test('[DTS] Enumerable', () => {
  assert.strictEqual(generate(['hello', 'world']), base + "('hello'|'world');" + exp);
  const data = ['hello', 'there', 'my', 'dear', 'world'];
  const result = `type MetaForge='hello'|'there'|'my'|'dear'|'world';`;
  assert.strictEqual(generate(data), result + exp);
});

test('[DTS] Union', () => {
  assert.strictEqual(
    generate({ $type: 'union', types: ['string', '?number'] }),
    'type MetaForge=(string|(number|null|undefined));' + exp,
  );
  assert.strictEqual(
    generate({ $type: 'union', types: [{ $type: 'union', types: ['string', '?number'] }] }),
    'type MetaForge=((string|(number|null|undefined)));' + exp,
  );
});

test('[DTS] Array', () => {
  assert.strictEqual(
    generate(['string', '?number']),
    'type MetaForge=[string,(number|null|undefined)];' + exp,
  );
  assert.strictEqual(
    generate({ $type: 'set', items: ['string', '?number'] }),
    'type MetaForge=Set<string|(number|null|undefined)>;' + exp,
  );
  assert.strictEqual(
    generate({ $type: 'array', items: { $type: 'union', types: ['string', '?number'] } }),
    'type MetaForge=((string|(number|null|undefined)))[];' + exp,
  );
  assert.strictEqual(
    generate({ $type: 'tuple', items: { $type: 'union', types: ['string', '?number'] } }),
    'type MetaForge=[(string|(number|null|undefined))];' + exp,
  );
  const enumerable = ['hello', 'there', 'my', 'dear', 'world'];
  const complex = ['?number', enumerable, { a: 'string', b: enumerable }];
  let result = "type MetaForge_1='hello'|'there'|'my'|'dear'|'world';";
  result += "type MetaForge_2_b='hello'|'there'|'my'|'dear'|'world';";
  result += 'interface MetaForge_2{a:string;b:MetaForge_2_b;};';
  result += 'type MetaForge=[(number|null|undefined),MetaForge_1,MetaForge_2];' + exp;
  assert.strictEqual(generate(complex), result);
});

test('[DTS] Struct', () => {
  const schema = { "'": 'string', '"': 'string', b: '?number', 'c+': { d: ['hello', 'world'] } };
  let result = "interface MetaForge_c{d:('hello'|'world');};";
  result += 'interface MetaForge{"\'":string;\'"\':string;';
  result += "b?:(number|null|undefined);'c+':MetaForge_c;};";
  result += exp;
  assert.strictEqual(generate(schema), result);
});

test('[DTS] Schema', () => {
  const schema = {
    $id: 'MySchema',
    a: 'string',
    b: { $id: 'MySubSchema', c: 'number' },
    c: new Schema('?string'),
    d: { $type: 'schema', schema: new Schema('number'), $id: 'MySubSchema2' },
    e: { $type: 'schema', schema: new Schema({ $type: 'number', $id: 'MySubSchema3' }) },
  };
  let r = 'interface MySubSchema{c:number;};type MySubSchema2=number;type MySubSchema3=number;';
  r += `interface MetaForge{a:string;b:MySubSchema;c?:(string|null|undefined);`;
  r += 'd:MySubSchema2;e:MySubSchema3;};';
  r += 'export type{MySubSchema,MySubSchema2,MySubSchema3,MetaForge};export default MetaForge;';
  assert.strictEqual(generate(schema), r);
});

test('[DTS] Modes', () => {
  const schema = new Schema({ a: { $id: 'MySubSchema', c: 'number' } });
  const result = 'interface MySubSchema{c:number;};interface MetaForge{a:MySubSchema;};';
  const mjs = result + 'export type{MySubSchema,MetaForge};export default MetaForge;';
  const cjs = result + 'export = MetaForge;';
  assert.strictEqual(schema.dts('MetaForge'), mjs);
  assert.strictEqual(schema.dts('MetaForge', { mode: 'cjs' }), cjs);
});
