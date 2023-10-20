# Changelog

## [Unreleased][unreleased]

<!-- ## [1.0.0][] - 2023-10-2\*

- Typescript types generation [issue](https://github.com/astrohelm/astroplan/issues/5)
- DOCS & Typings & JSDoc [issue](https://github.com/astrohelm/astroplan/issues/11) -->

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

[unreleased]: https://github.com/astrohelm/metaforge/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/astrohelm/metaforge/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/astrohelm/metaforge/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/astrohelm/metaforge/releases/tag/v0.1.0
