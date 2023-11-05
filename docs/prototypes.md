# About prototypes

## Readme Map

- [Schemas contracts](#schemas-contracts)
- [How to build custom prototype](#writing-custom-prototypes)

## Schemas contracts

Default prototypes separated by kinds:

- [scalar](#scalars) - value does not contain other prototypes
- [struct](#structs), [struct](#iterable-structs) - value also contains other prototypes
- [union](#union) - prototypes union
- [enum](#enum) - enumerable value
- And [unknown](#unknown)

### Scalar:

- string
- number
- bigint
- boolean

#### Schema:

```ts
interface Scalar {
  $type: 'string' | 'number' | 'bigint' | 'boolean';
  $required: boolean;
}
```

#### Example:

```js
'?string'; // With Hanyman module
({ $type: 'string', $required: false });
```

### Iterable structs:

- tuple
- array
- set

If items recieved array, struct will automatically moved to tuple mode.

#### Schema

```ts
type Prototype; // Any prototype plan
interface Iterable {
  $type: 'array' | 'set' | 'tuple';
  $required: boolean;
  items: Prototype[] | Prototype;
}
```

#### Example:

```js
// With Hanyman module
['number', '?string']; // tuple
({ $type: 'array', items: 'number' }); // array of numbers
({ $type: 'set', items: { $type: 'union', types: ['number', '?string'] } }); // set of numbers & strings
// Without
({
  // tuple
  $type: 'tuple',
  items: [{ $type: 'number' }, { $type: 'string', required: false }],
  $required: false,
});
({
  // array of numbers
  $type: 'array',
  items: { $type: 'number' },
  $required: false,
});
({
  // set of numbers & strings
  $type: 'set',
  items: { $type: 'union', types: [{ $type: 'number' }, { $type: 'string', required: false }] },
  $required: false,
});
```

### Structs:

- record (Exotic properties are not allowed)
- object
- map

#### Schema

```ts
type Prototype = unknown & { isPattern?: boolean }; // Any prototype plan
interface Struct {
  $type: 'object' | 'record' | 'map';
  $required: boolean;
  $properties: { [key: string]: Prototype };
}
```

#### Example

Properites can contain pattern properties

```js
({
  $type: 'object',
  $required: true,
  properties: {
    name: { $type: 'string' },
    '[a-z]+Id': { $type: number, isPattern: true },
  },
});
```

### Union:

Union is an a set of schemas with join conditions:

- **allof** - Sample should pass all schemas (&)
- **oneof** - Sample should pass only one schema (|)
- **anyof** - Sample should pass any schemas (|)

#### Schema

```ts
type Prototype; // Any prototype plan
interface Union {
  $type: 'union';
  $required: boolean;
  types: Prototype[];
  condition: 'allof' | 'oneof' | 'anyof';
}
```

#### Example

```js
// Handyman example:
({
  $type: 'union',
  types: ['string', 'boolean'],
  condition: 'oneof',
});
// Without:
({
  $type: 'union',
  types: [{ $type: 'string' }, { $type: 'boolean' }],
  condition: 'oneof',
});
```

### Enum:

Enumerable prototype

#### Schema

```ts
interface Enum {
  $type: 'enum';
  $types: (string | number)[];
  $required: boolean;
}
```

#### Example

```js
// With handyman
['winter', 'spring', 'summer', 'autumn'];
// Without
{ $type: 'enum', enum:['winter', 'spring', 'summer', 'autumn'], $required: true }
```

### Unknown:

- any
- unknown

Metatest will check only for requirement & rules (if passed);

#### Schema

```ts
type Unknown = { $type: 'any' | 'unknown'; $required: true };
```

#### Example

```js
// With handyman
'any'
// Without
{ $type: 'any', $required: true }
```

## Writing custom prototypes

Custom properties can be written as:

- class
- object
- object with construct method
- arrow function
- function

### Definition variants example:

```js
function MyPrototype(plan, tools) {
  this.someData = 'data'; // Assign any data to prototype;
}

const MyPrototype = (plan, tools) => ({
  someData: 'data';
});

const MyPrototype = { someData: 'data' };

class MyPrototype {
  someData = 'data';
  constructor(plan, tools) {
    this.required = plan.$required ?? true;
  }
}
```

> Prototypes will receive next parameters to their constructor:
>
> - plan - described data by subset of javascript
>   ```javascript
>   ({
>     $type: 'string',
>     $required: true,
>     // other related to prototype properties
>   });
>   ```
> - tools - { Error, warn, build }
>
> ```js
> const err = new Error({ cause, plan, sample, sampleType, path }); // Creates SchemaError
> const warning = warn({ cause, plan, sample, sampleType, path }); // push SchemaError to schema.warnings
> const ForgePrototype = build(plan); // if your data contains sub plans you may build
> ```

### Injecting custom prototypes

- Prototypes can be passed to schema options as Map, entries or object.
- **Only in modules** Or you can inject your prototype with <code>schema.forge.attach</code>.
- Your prototype **must starts** with lower case
- If prototype already exists your prototype will be pushed at the end of prototype chain (higher
  priority properties)

```js
const schemaA = new Schema('?myPrototype', { prototypes: { MyPrototype } });
const schemaB = new Schema(
  { $type: 'myPrototype', required: false },
  { prototypes: new Map(Object.entries({ MyPrototype })) },
);

// They are equal
schemaA; // { ..., someData: 'data', $required: false }
schemaB; // { ..., someData: 'data', $required: false }
```
