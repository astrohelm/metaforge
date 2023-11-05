# Modules or another words Plugins

You can extend schema functionality using modules;

## Default Modules

- [Handyman](../modules/handyman/README.md) | quality of life module
- [Metatest](../modules/test/README.md) | adds prototype testing
- [Metatype]('../modules/types/README.md') | generate typescript:JSDOC from schema

## Writing custom modules

First, create your module:

```js
const module = (schema, options, plan) => {};
```

It will receive as parameters **Schema instance**, **options** witch used to create schema and
**plan**; You can use it for extend schema or prototypes functionality;

```js
const module = (schema, options, plan) => {
  const { forge, tools } = schema;
  // Define variables
  this.forge.attach('after', { createdAt: new Date() });
  // Define default variables (will be replaced if exists in other prototype)
  this.forge.attach('before', { myVariable: 1 });
  // Update existed prototype chains or create new chain
  this.forge.attach('custromProto', { createdAt: 'now', myVariable: 'Hello' });
  // Return builded Prototype chain as ForgePrototype
  this.forge.get('string'); // { ..., myVariable: 1, createdAt: Date }
  this.forge.get('customProto'); // { ..., myVariable: 'Hello', createdAt: Date }
  // Create new functionality for schemas
  this.schema.from = plan => new Schema(plan); /
  // Extend prototype tooling
  tools.isRequired = plan => plan.$required ?? true;
};
```

Finally, you can register your module

```js
const schema = new Schema(plan, { modules: new Map() }); // To replace global modules
schema.register('MyModule', module); // To define your module to single instance
Schema.modules.set('MyModule', module); // To define your module globally
```

> - You can push prototype to the wrappers (before - the lowest priority & after - the highest
>   priority)
> - If you want to attach prototype to chain - prototype **must starts** with lower case
> - If prototype already exists your prototype will be pushed at the end of prototype chain (higher
>   priority properties)
