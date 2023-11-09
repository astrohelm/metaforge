# Metatype module

Generate type annotations & jsdoc from schema;

## Usage

```js
const plan = 'string';
const schema = new Schema(plan);
schema.dts('Example'); // Equal to:
schema.dts('Example', { export: { type: 'mjs', mode: 'all' } });
// type Example = string;
// export type = { Example };
// export default Example;
schema.dts('Example', { export: { type: 'mjs', mode: 'no' } });
// type Example = string;
schema.dts('Example', { export: { type: 'mjs', mode: 'exports-only' } });
// type Example = string;
// export type = { Example };
schema.dts('Example', { export: { type: 'mjs', mode: 'default-only' } });
// type Example = string;
// export default Example;
schema.dts('Example', { export: { type: 'cjs' } });
// type Example = string;
// export = Example;
```

## Example

### Input:

```js
{
  $meta: { '@name': 'User', '@description': 'User data' }
  "firstName": 'string',
  "lastName": { $type: '?string', $meta: { '@description': 'optional' } },
  "label": ["member", "guest", "vip"]
  "age": '?number',
  settings: {
    $id: 'Setting',
    alertLevel: 'string',
    $meta: { '@description': 'User settings' }
  }
}
```

### Output:

```ts
/**
 * @description User settings
 */
interface Settings {
  alertLevel: string;
}

/**
 * @name User
 * @description User data
 */
interface Example {
  firstName: string;
  /**
   * @description optional
   */
  lastName?: string;
  label: 'member' | 'guest' | 'vip';
  age?: number;
  settings: Settings;
}

export type { Example };
export default Example;
```

## Writing custom prototypes with Metatype

By default all custom types will recieve unknown type; If you want to have custom type, you may
create custom prototype with toTypescript field;

> If your prototype has children prototypes, it not be handled with jsdoc comments;

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
    //? Returned value will be assigned to other type or will be exported if it was on top
  };
}
```

## JSDOC

To have JSDOC comments in your type annotations you need to add <code>\$meta</code> field to your
schema; Also, your <code>\$meta</code> properties should start with <code>@</code>;

### Example

```js
({
  reciever: 'number',
  money: 'number',
  $meta: {
    '@version': 'v1',
    '@name': 'Pay check',
    '@description': 'Cash settlement',
    '@example': '<caption>Check example</caption>\n{ money: 100, reciever: 2 }',
  },
});
```
