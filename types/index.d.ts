class SchemaError {
  constructor(options: { pattern: (dict: { [key: string]: string }) => string }) {}
  plan: unknown;
  message: string;
  path: string;
  sample: unknown;
  sampleType: string;
  cause: string;
}

type Rule = 'string' | ((sample: string, path?: string, partial?: boolean) => unknown);
interface PlanCore {
  $meta?: { [key: string]: unknown };
  $rules?: Array<Rule> | Rule;
  $required?: boolean;
  $type?: string;
  $id?: string;
  [key: string]: unknown;
}

interface Options {
  errorPattern?: (dict: { [key: string]: string }) => string;
  /**
   * @description works only with metatest module
   */
  rules?: Map<string, Rule> | { [key: string]: Rule };
  /**
   * @description works only with handyman module
   */
  namespace?: Map<string, Schema> | { [key: string]: Schema } | [string, Schema][];
}

interface Tools {
  Error: typeof SchemaError;
  /**
   * @description Use if your prototype contains child prototypes;
   * @example <caption>Building prototype</caption>
   * const plan = { $type: 'array', items: {...}};
   * build(plan); // wouldnt build items
   * // output: ForgePrototype{}
   */
  build: (plan: Plan) => ProtoObject;
  /**
   * @description Push warning to schema.warnings
   */
  warn: (opts: {
    path?: string;
    cause: string;
    sample: unknown;
    sampleType: string;
  }) => SchemaError;
}

type ProtoObject = { construct?: ProtoFunction; [key: string]: unknown };
type ProtoFunction = (plan: Plan, tools: Tools, isPartial?: boolean) => object;
class ProtoClass implements ProtoObject {
  constructor(plan: Plan, tools: Tools, isPartial?: boolean) {}
  [key: string]: unknown;
}
type Proto = ProtoClass | ProtoFunction | ProtoObject;

class ForgePrototype {
  $id?: string;
  $kind: string;
  $type: string;
  $required: boolean;
  $plan: Plan;
  /**
   * Metatest module required
   * @description Test any sample for compatibility
   * @example
   * const schema = new Schema('string');
   * schema.test('Hello world').valid // true
   * schema.test(123) // [SchemaError {}]
   * schema.test(123).valid // false
   */
  test?: (
    sample: unknown,
    root?: string,
    partial?: boolean,
  ) => Array<SchemaError> & { valid: boolean };
  /**
   * Metatest module required
   * @description Generates type declaration file for schema
   * @example
   * const schema = new Schema('string').dts('MyType');
   * // type MyType = (unknown | undefined);
   * // export type { MyType };
   * // export default MyType;
   */
  dts?: (
    name?: string,
    options?: {
      export: { mode?: 'cjs' | 'mjs'; type: 'all' | 'no' | 'exports-only' | 'default-only' };
    },
  ) => string;
  /**
   * Handyman module required
   * @description Calculated fields
   * @example
   * const example = { name: 'Alexander' };
   * const schema = { name: 'string', phrase: (_, parent) => 'Hello ' + parent.name }
   * new Schema(schema).calculate(example, true); // { name: 'Alexander', phrase: 'Hello Alexander' }
   * example; // Not assigned to sample object { name: 'Alexander' };
   * new Schema(schema).calculate(exampl); // { name: 'Alexander', phrase: 'Hello Alexander' }
   * example; // Assigned to sample object { name: 'Alexander', phrase: 'Hello Alexander' };
   */
  calculate?: (sample: unknown, mode?: boolean) => unknown;
  /**
   * @description Do not use directly - Internal mechanism of type generation
   */
  toTypescript?: (
    name: string,
    namespace: { definitions: Set<string>; exports: Set<string> },
  ) => string;
  [key: string]: unknown;
}

/**
 * @description Prototype chain storage or ENGINE
 * @example <caption>Attach prototype</caption>
 * forge.attach('string', { myField: 'test'  });
 * forge.attach('string', { myField: 'test', construct(plan, tools){ return this; }  });
 * forge.attach('string', (plan, tools) => ({ myField: 'test'  }));
 * forge.attach('string', function Proto(plan, tools){ myField: 'test'  });
 * forge.attach('string', class Proto{ myField ='test'; constructor(plan, tools){};  });
 * @description This method will build chain of prototype
 * @example <caption>Get prototype</caption>
 * forge.get('string'); // ForgePrototype {}
 */
class Forge extends Map {
  constructor(schema: Schema, prototypes?: Map<string, Proto>) {}
  /**
   * @description Will add your prototype to the end of the prototype chain
   * @example <caption>Attach prototype</caption>
   * forge.attach('string', { myField: 'test'  });
   * forge.attach('string', { myField: 'test', construct(plan, tools){ return this; }  });
   * forge.attach('string', (plan, tools) => ({ myField: 'test'  }));
   * forge.attach('string', function Proto(plan, tools){ myField: 'test'  });
   * forge.attach('string', class Proto{ myField ='test'; constructor(plan, tools){};  });
   */
  set: (name: string, ...prototypes: Proto[]) => Forge;
  /**
   * @description Will copy prototype chain to other prototype chain
   * @warning It will copy also all other modules prototypes
   * @example <caption>Attach prototype</caption>
   * forge.setCopy('string', 'myCustomString', { myField: 'test'  });
   */
  setCopy: (from: string, to: string, ...prototypes: Proto[]) => Forge;

  /**
   * @description Returns prototype chain
   * @warning This method can return after & before wrappers
   * @example <caption>Get prototype chain</caption>
   * const chain = forge.get('string'); // [{ kind: 'string' }, ...];
   */
  get: (name: string) => Proto[];

  /**
   * @description This method will build prototype chain into Type class object
   * @example <caption>Get prototype</caption>
   * const ForgePrototype = forge.build('string'); // ForgePrototype {}
   * new ForgePrototype(plan, tools);
   */
  build: (name: string) => { new (plan: Plan): ForgePrototype };
}

type TModule = (schema: Schema, options: Options, plan: Plan) => void;
type Plan = string | PlanCore | Schema;

/**
 * @description Describe your data structures by subset of JavaScript and:
 *  - Generate data relational structures (types, diagrams, migrations, etc.)
 *  - Validate it in runtime with strict & partial validations
 *  - Send it to other server to validate data consistency
 *  - Handle it with custom modules
 *  - Calculate fields
 * @example
 * const schema = new Schema({ $type: 'string' });
 * schema.test('Hello world').valid; // true
 */
class Schema extends ForgePrototype {
  forge: Forge;
  modules: Map<string, undefined>;
  warnings: Array<SchemaError>;
  tools: Tools;
  constructor(plan: Plan, options?: Options) {}
  /**
   * Handyman module required
   * @description Pull subschema from namespace or with field $id;
   * @example
   * schema.pull('MyModule'); // Schema {}
   */
  pull?: (name: string) => Schema | null;
  /**
   * @description Register new module
   * @example
   * const module = (schema, options, plan) => {};
   * schema.register('MyModule', module)
   */
  register: (name: string, module: TModule) => void;
  [key: string]: unknown;
}

export = Schema;
