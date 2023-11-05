<h1 align="center">MetaForge v0.4.0 🕵️</h1>

## Usage example

```js
const userSchema = new Schema({
  $id: 'userSchema',
  phone: { $type: 'union', types: ['number', 'string'] }, //? anyof tyupe
  name: { $type: 'set', items: ['string', '?string'] }, //? set tuple
  mask: { $type: 'array', items: 'string' }, //? array
  ip: {
    $type: 'array',
    $required: false,
    $rules: [ip => ip[0] === '192'], //? custom rules
    items: { $type: 'union', types: ['string', '?number'], condition: 'oneof', $required: false },
  },
  type: ['elite', 'member', 'guest'], //? enum
  adress: 'string',
  secondAdress: '?string',
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
    adress: 'Pushkin street',
  },
  {
    phone: 79999999999,
    type: 'guest',
    mask: ['255', '255', '255', '0'],
    name: new Set(['Alexander', 'Ivanov']),
    options: { notifications: false, lvls: [2, '["admin", "user"]'] },
    adress: 'Pushkin street',
  },
];

systemSchema.test(sample); // Shema validation
systemSchema.pull('userSchema').test(sample[0]); // Subschema validation
systemSchema.pull('userSchema').test({ phone: 123 }, 'root', true); // Partial validation
```

<p align="center">
Copyright © 2023 <a href="https://github.com/astrohelm/metaforge/graphs/contributors">Astrohelm contributors</a>.
This library is <a href="./LICENSE">MIT licensed</a>.<br/>
And it is part of <a href="https://github.com/astrohelm">Astrohelm ecosystem</a>.
</p>
