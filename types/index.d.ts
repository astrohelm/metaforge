// all exports = module.exports items
export const lib: {};

// anyof(||) oneof(only one) allof(&&)
// throwFirst, throwAll ^
// Model = Upper / Type = lower ^
// SchemaSkip
// Schema export / import
// Pattern properties

interface ErrorOptios {
  throw: 'first' | 'all';
  warnings: 'as-errors' | 'warnings' | 'ignore';
}
