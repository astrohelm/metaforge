//TODO: #1 Rules & Tests
//TODO: #2 Parser for samples
//TODO: #3 Typescript code generation
//TODO: #4 FS UTilities
//TODO: #5 Types
//TODO: #6 README

type Condition = 'allof' | 'anyof' | 'oneof';
type TypeField = { type: Type | Type[]; condition?: Condition };
type Rule = (sample: unknown, tools: Tools) => SchemaError[];
type Type = string | TypeObject;

interface Tools {
  Error: SchemaError;
  isRequired: (plan: string) => boolean;
  isShorthand: (plan: ) => boolean;
  typeOf: (plan: ) => Type[];
}

interface TypeObject {
  type: string;
  rules?: [];
  meta?: { [key: string]: unknown };
}

interface SchemaError {}
interface TOptions {
  errorPattern?: string;
}

interface TObject {
  type: 'map' | 'object';
  properties: { [key: unknown]: TypeField };
  patternProperties: { [key: unknown]: TypeField };
}

interface TArray {
  type: 'set' | 'array';
  items: Array<Type>;
  condition: Condition;
}

export default class Schema {
  kind?: 'struct' | 'scalar' | 'any';
  subtype?: string;
  type?: string;
  warnings: Array<SchemaError>;
  constructor(plan: string | TType, options?: TOptions);
  test: (sample: unknown, root?: string) => Array<SchemaError>;
  [key: string]: string;
}
