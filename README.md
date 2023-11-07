<h1 align="center">MetaForge v0.7.0 🕵️</h1>

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
  $meta: { name: 'user', description: 'schema for users testing' },
  phone: { $type: 'union', types: ['number', 'string'] }, //? number or string
  name: { $type: 'set', items: ['string', '?string'] }, //? set tuple
  prase: (sample, parent, root) => 'Hello ' + [...parent.name].join(' ') + ' !', // Calculated fields
  mask: { $type: 'array', items: 'string' }, //? array
  ip: {
    $type: 'array',
    $required: false,
    $rules: [ip => ip[0] === '192'], //? custom rules
    items: { $type: 'union', types: ['string', '?number'], condition: 'oneof', $required: false },
  },
  type: ['elite', 'member', 'guest'], //? enum
  address: 'string',
  secondAddress: '?string',
  options: { notifications: 'boolean', lvls: ['number', 'string'] },
});

const systemSchema = new Schema({ $type: 'array', items: userSchema });

const sample = [
  {
    phone: '7(***)...',
    ip: ['192', 168, '1', null],
    type: 'elite',
    mask: ['255', '255', '255', '0'],
    name: new Set(['Alexander', null]),
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
