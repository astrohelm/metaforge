<h1 align="center">MetaForge v1.0.0 🕵️</h1>

## Describe your data structures by subset of JavaScript and:

- 📝 Generate data relational structures (types, jsdoc, diagrams, migrations, etc.)
- 🔎 Validate it in runtime with strict & partial validations
- 👀 Send it to other server to validate data consistency
- 🛠️ Handle it with custom modules
- 💉 Calculate fields

## Installation

```bash
npm i metaforge --save
```

## Usage example

```js
const userSchema = new Schema({
  $id: 'userSchema',
  $meta: { '@name': 'User', '@description': 'Schema for user testing' }, //? JSDOC
  phone: { $type: 'union', types: ['number', 'string'] }, //? number or string
  name: { $type: 'set', items: ['string', '?string'] }, //? set tuple
  phrase: (sample, parent, root) => 'Hello ' + [...parent.name].join(' ') + ' !', // Calculated fields
  mask: { $type: 'array', items: 'string' }, //? array of strings
  ip: {
    $meta: { '@description': 'User ip adress' },
    $type: 'array',
    $required: false,
    $rules: [ip => ip[0] === '192'], //? custom rules
    items: {
      $type: 'union',
      types: ['string', 'number', 'null'], // Array<string | null | number>
      condition: 'oneof',
      $required: true,
    },
  },
  type: ['elite', 'member', 'guest'], //? enum
  '/[a-Z]+Id/': { $type: '?number', isPattern: true }, // pattern fields
  address: 'string',
  secondAddress: '?string', // optional fields
  options: { notifications: 'boolean', lvls: ['number', 'string'] },
});

const systemSchema = new Schema({ $type: 'array', items: userSchema });

const sample = [
  {
    myId: 1,
    phone: '7(***)...',
    ip: ['192', 168, '1', null],
    type: 'elite',
    mask: ['255', '255', '255', '0'],
    name: new Set(['Alexander', undefined]),
    options: { notifications: true, lvls: [2, '["admin", "user"]'] },
    address: 'Pushkin street',
  },
  //...
];

systemSchema.warnings; // Inspect warnings after build
systemSchema.calculate(sample); // Will assign calculated fields
systemSchema.test(sample); // Schema validation
systemSchema.dts('SystemInterface'); // Typescript generation
systemSchema.pull('userSchema').test(sample[0]); // Subschema validation
systemSchema.pull('userSchema').test({ phone: 123 }, 'root', true); // Partial validation
systemSchema.pull('userSchema'); // Metadata: {..., name: 'user', description: 'schema for users testing'}
```

## Docs

- ### [About modules / plugins](./docs/modules.md#modules-or-another-words-plugins)
  - [Writing custom modules](./docs/modules.md#writing-custom-modules)
  - [Metatype](./modules/types/README.md) | generate type annotations from schema
  - [Handyman](./modules/handyman/README.md) | quality of life module
  - [Metatest](./modules/test/README.md) | adds prototype testing
- ### [About prototypes](./docs/prototypes.md#readme-map)
  - [How to build custom prototype](./docs/prototypes.md#writing-custom-prototypes)
  - [Contracts](./docs/prototypes.md#schemas-contracts)

<h2 align="center">Copyright & contributors</h2>

<p align="center">
Copyright © 2023 <a href="https://github.com/astrohelm/metaforge/graphs/contributors">Astrohelm contributors</a>.
This library is <a href="./LICENSE">MIT licensed</a>.<br/>
And it is part of <a href="https://github.com/astrohelm">Astrohelm ecosystem</a>.
</p>
