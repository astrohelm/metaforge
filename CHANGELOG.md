# Changelog

## [Unreleased][unreleased]

## [0.7.0][] - 2023-11-07

- Calculated fields
- Readme & tests for module

## [0.6.0][] - 2023-11-06

- Typescript generation module
- Documentation fixes

## [0.5.0][] - 2023-11-05

- Readme enhancement
- JSDOC documentation

## [0.4.0][] - 2023-11-05

- Support latest:21 node version
- Removed parser (maybe temporary)
- TypeScript .d.ts support
- Schema field with multiple type variants now works only with special type <code>union</code>
- Modular mechanism (internal rework): **How it works**

  ```js
  const schema = new Schema();
  schema.register((schema, options, plan) => {}); //? Register new module
  ```

  By default registrated modules are:

  - Metatest module (Adds tests for prototypes)
  - Metatype module (Typescript parser)
  - Handyman (Quality of life module)

  But you also remove default modules:

  ```js
  Schema.modules.delete('metatest');
  ```

- New shorthands for:
  - enum example: <code>['winter', 'spring', 'summer, 'autumn']</code>
  - tuple example: <code>['string', 'number']</code>
  - object example: <code>{ a: string, b: number }</code>
  - string example: <code>'string'</code>
  - schema example: <code>'MyGlobalSchema'</code>
  - schema#2 example: <code>new Schema('string')</code>
- Removed preprocessor mechanism
- Schemas now can be part of plan
- Performance improvements (by removing unnecessary modules)
- Lightweight inheritance
- Removed type JSON (temporary)
- Prototype chaining
- Partial testing
- New prototypes:
  - Tuple
  - Record
  - Schema
  - Union

## [0.3.0][] - 2023-10-19

- Plan generation from sample [issue](https://github.com/astrohelm/astroplan/issues/10)
- Schema child method, now you can update only schema or only options for new schemas
- Metadata fetcher, now you can gather all metadata by <code>schema.meta</code>
- Fixed case when schema returns only methods without metadata, now it returns prototypes key with
  all metadata
- Preprocess & postprocess for objects properties mutations
- New prototype <code>enum</code>
- Code cleanup & tests

## [0.2.0][] - 2023-10-18

- Renamed astroplan -> metaforge
- Meta information & Builded tree export [issue](https://github.com/astrohelm/astroplan/issues/8)
- Custom checks (rules) [issue](https://github.com/astrohelm/astroplan/issues/7)
- Allow custom types, schemas and rules to return value of string, array, boolean and SchemaError
  types;

## [0.1.0][] - 2023-10-16

- Stable release version
- Warnings before testing
- Repository created
- Namespaces, runtime schema checking, custom types
- Default struct types: Array, Set, Map, Object
- Default scalar types: String, Boolean, Number, BigInt
- Default exotic types: Any, Undefined, JSON
- Custom Errors

[unreleased]: https://github.com/astrohelm/metaforge/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/astrohelm/metaforge/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/astrohelm/metaforge/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/astrohelm/metaforge/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/astrohelm/metaforge/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/astrohelm/metaforge/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/astrohelm/metaforge/releases/tag/v0.1.0
