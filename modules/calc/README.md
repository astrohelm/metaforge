# Calculated fields

Calculated fields supposed to do preprocessing of your schema;

## Example

```js
const schema = {
  $id: 'user',
  name: 'string',
  phrase: schema => 'Hello ' + schema.name + ' !',
};

Schema.calc({ name: 'Alexander' });
// { ..., name: 'Alexander', phrase: 'Hello Alexander !'};
schema; // { $id: 'user', name: 'Alexander', phrase: 'Hello Alexander !'};
```

## Writing calculated fields

Calculated fields is a function that receives two arguments:

- root: root object <code>{ input: Sample }</code>
- parent: assigned target object

> Warning: your return value will be assigned to samples

## Additional

Method <code>schema.calc</code> receives mode as second parameter; This method allow to specify
return value as:

- Schema.calc(sample, true); // Returns copy of sample with assigned values
- Schema.calc(sample); // Returns sample object with assigned values
