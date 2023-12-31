/* eslint-disable quotes */
'use strict';

const [test, assert] = [require('node:test'), require('node:assert')];
const Schema = require('../../');

const generate = (type, name) => new Schema(type).dts(name);
const base = 'type MetaForge = ';
const exp = '\nexport type { MetaForge };\nexport default MetaForge;';
test('[DTS] Basic', () => {
  assert.strictEqual(generate({ $type: 'string' }), base + 'string;' + exp);
  assert.strictEqual(generate('number'), base + 'number;' + exp);
  assert.strictEqual(generate('bigint'), base + 'bigint;' + exp);
  assert.strictEqual(generate('boolean'), base + 'boolean;' + exp);
  assert.strictEqual(generate('unknown'), base + 'unknown;' + exp);
  assert.strictEqual(generate('?any'), base + '(any|undefined);' + exp);
});

test('[DTS] Enumerable', () => {
  assert.strictEqual(generate(['hello', 'world']), base + "('hello'|'world');" + exp);
  const data = ['hello', 'there', 'my', 'dear', 'world'];
  const result = `type MetaForge = ('hello'|'there'|'my'|'dear'|'world');`;
  assert.strictEqual(generate(data), result + exp);
});

test('[DTS] Union', () => {
  assert.strictEqual(
    generate({ $type: 'union', types: ['string', '?number'] }),
    'type MetaForge = (string|(number|undefined));' + exp,
  );
  assert.strictEqual(
    generate({ $type: 'union', types: [{ $type: 'union', types: ['string', '?number'] }] }),
    'type MetaForge = ((string|(number|undefined)));' + exp,
  );
});

test('[DTS] Array', () => {
  assert.strictEqual(
    generate(['string', '?number']),
    'type MetaForge = [string,(number|undefined)];' + exp,
  );
  assert.strictEqual(
    generate({ $type: 'set', items: ['string', '?number'] }),
    'type MetaForge = Set<string|(number|undefined)>;' + exp,
  );
  assert.strictEqual(
    generate({ $type: 'array', items: { $type: 'union', types: ['string', '?number'] } }),
    'type MetaForge = ((string|(number|undefined)))[];' + exp,
  );
  assert.strictEqual(
    generate({ $type: 'tuple', items: { $type: 'union', types: ['string', '?number'] } }),
    'type MetaForge = [(string|(number|undefined))];' + exp,
  );
  const enumerable = ['hello', 'there', 'my', 'dear', 'world'];
  const complex = ['?number', enumerable, { a: 'string', b: enumerable }];
  const strEnum = `('hello'|'there'|'my'|'dear'|'world')`;
  let result = `interface MetaForge_2 {\n  a: string;\n  b: ${strEnum};\n};\n\n`;
  result += `type MetaForge = [(number|undefined),${strEnum},MetaForge_2];` + exp;
  assert.strictEqual(generate(complex), result);
});

test('[DTS] Struct', () => {
  const schema = { "'": 'string', '"': 'string', b: '?number', 'c+': { d: ['hello', 'world'] } };
  let result = "interface MetaForge_c {\n  d: ('hello'|'world');\n};\n\n";
  result += 'interface MetaForge {\n  "\'": string;\n  \'"\': string;';
  result += "\n  b?: (number|undefined);\n  'c+': MetaForge_c;\n};" + exp;
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
  let r = 'interface MySubSchema {\n  c: number;\n};\n\ntype MySubSchema2 = number;\n\n';
  r += `type MySubSchema3 = number;\n\n`;
  r += 'interface MetaForge {\n  a: string;\n  b: MySubSchema;';
  r += `\n  c?: (string|undefined);\n  d: MySubSchema2;\n  e: MySubSchema3;\n};\n`;
  r += 'export type { MySubSchema, MySubSchema2, MySubSchema3, MetaForge };';
  r += '\nexport default MetaForge;';
  assert.strictEqual(generate(schema), r);
});

test('[DTS] JSDoc', () => {
  const schema = new Schema({
    $id: 'User',
    $meta: { '@name': 'user', '@description': 'About user' },
    name: { $type: 'string', $meta: { '@description': 'User name' } },
    age: '?number',
  });
  let result = '/**\n * @name user\n * @description About user\n */\n';
  result += 'interface MetaForge {\n  /**\n   * @description User name\n   */\n';
  result += '  name: string;\n  age?: (number|undefined);\n};\n\n';
  result += 'export type { MetaForge };\nexport default MetaForge;';
  assert.strictEqual(schema.dts(), result);
});
