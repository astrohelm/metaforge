# Metatest module / adds prototype testing

Metatest module provides tests for default prototypes and wrapper for custom prototypes;

Also Metatest provides rule & partial object testing

```js
new Schema('string').test('Hello World').valid; // true
new Schema('string').test(123).valid; // false
new Schema('string').test(123); // SchemaError[]
const plan = { $type: '?string', $rules: [v => v.length > 5] };
new Schema(plan).test().valid; // true
new Schema(plan).test(123).valid; //false
new Schema(plan).test('Test').valid; //false
new Schema(plan).test('Hello world').valid; //true
const plan = { field1: 'string', field2: 'number' }; // partial testing
new Schema(plan).test({ field2: 1 }, 'root', true).valid; //true
```

## Writing custom prototypes with Metatest

If you want to have custom test, you may create custom prototype with test field; This field will be
wrapped by Metatest or, if field does not exist it will be stubbed by empty test;

```js
function Date(plan, tools) {
  this.test = (sample, path, isPartial) => {
    if (!isNaN(new Date(sample))) return null;
    return 'Value not a Date';
    // Equal to:
    // return new tools.Error({ path, sample, cause: 'Value not a Date', plan })
  };
}

const schema = new Schema('date', { prototypes: { date: Date } });
schema.test(new Date()).valid; // true
schema.test(); // SchemaError { cause: 'Required value' }
schema.test('hello world').valid; // SchemaError { cause: 'Value not a Date' }
```

Your errors will be wrapped by SchemaError;

Your tests may return any value:

- **string**: empty - **ok**, else - **fail**
- **boolean**: false - **fail**, true - **ok**
- **array**: if not empty - **fail**, else - **ok**
- **object**: always **fail**
- **other** always **ok**
