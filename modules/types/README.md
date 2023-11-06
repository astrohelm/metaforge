# Metatype module

Generate type annotation from schema;

> Warning: You will receive compressed version;

## Usage

By default module runs in mjs mode, that means that:

- It will export all schemas with $id field & root schema
- it will export as default root schema

> In cjs mode, it will export only root schema

```js
const plan = 'string';
const schema = new Schema(plan);
schema.dts('Example', { mode: 'mjs' });
// type Example = string;
// export type = { Example };
// export default Example;
```

## Example

### Input:

```js
{
  "firstName": 'string',
  "lastName": 'string',
  "label": ["member", "guest", "vip"]
  "age": '?number',
  settings: { alertLevel: 'string', $id: 'Setting' }
}
```

### Output (mjs mode):

```ts
interface Settings {
  alertLevel: string;
}

interface Example {
  firstName: string;
  lastName: string;
  label: 'member' | 'guest' | 'vip';
  age?: number;
  settings: Settings;
}

export type { Example };
export default Example;
```

### Output (cjs mode):

```ts
interface Settings {
  alertLevel: string;
}

interface Example {
  firstName: string;
  lastName: string;
  label: 'member' | 'guest' | 'vip';
  settings: Settings;
  age?: number;
}

export = Example;
```

## Writing custom prototypes with Metatype

By default all custom types will recieve unknown type; If you want to have custom type, you may
create custom prototype with toTypescript field;

```js
function Date(plan, tools) {
  this.toTypescript = (name, namespace) => {
    // If you want to have your type in exports, you can add it name to exports;
    const { definitions, exports } = namespace;
    // If your type is complex, you can push your builded type / interface to definitions and return it name
    const type = `type ${name} = Date`;
    definitions.add(type);
    //? You can return only name or value that can be assigned to type
    return name; // Equal to:
    return 'Date';
  };
}
```
