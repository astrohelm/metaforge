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
  test?: (
    sample: unknown,
    root?: string,
    partial?: boolean,
  ) => Array<SchemaError> & { valid: boolean };
  toTypescript?: () => string;
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
class Forge {
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
  attach: (name: string, ...prototypes: Proto[]) => void;
  /**
   * @description This method will build chain of prototype
   * @example <caption>Get prototype</caption>
   * forge.get('string'); // ForgePrototype {}
   */
  get: (name: string) => { new (plan: Plan): ForgePrototype };
  has: (name: string) => boolean;
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
