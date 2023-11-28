# Modules or another words Plugins

You can extend schema functionality using modules;

## Default Modules

Default modules are enabled by default, here they are:

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
  // Define important variables
  this.forge.set('after', () => ({ createdAt: new Date() }));
  // Define default variables (will be replaced if exists in other prototype)
  this.forge.set('before', { myVariable: 1 });
  // Update existed prototype chains or create new chain
  this.forge.set('custromProto', { createdAt: 'now', myVariable: 'Hello' });
  // Update existed prototype chains or create new chain from existing chain
  this.forge.setCopy('string', 'myCustomString', () => ({ createdAt: new Date() }));
  // Return builded Prototype chain as ForgePrototype
  this.forge.set('string'); // { ..., myVariable: 1, createdAt: Date }
  this.forge.set('customProto'); // { ..., myVariable: 'Hello', createdAt: Date }
  // Create new functionality for schemas
  this.schema.from = plan => new Schema(plan);
  // Extend prototype tooling
  tools.isRequired = plan => plan.$required ?? true;
};
```

Finally, you can register your module

```js
// To define your module locally
const schema = new Schema(plan, { modules: new Map([...Schema.modules, ['MyModule', module]]) });
// To replace global modules
const schema = new Schema(plan, { modules: new Map() });
// To define your module globally
Schema.modules.set('MyModule', module);
```

> - Order of modules matters, latest module will work with previous modules results
> - You can push prototype to the wrappers (before - the lowest priority & after - the highest
>   priority)
> - If you want to attach prototype to chain - prototype **must starts** with lower case
> - If prototype already exists your prototype will be pushed at the end of prototype chain (higher
>   priority properties)
