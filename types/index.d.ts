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
  rules?: Map<string, Rule> | { [key: string]: Rule };
  namespace?: Map<string, Schema> | { [key: string]: Rule };
}

interface Tools {
  Error: typeof SchemaError;
  build: (plan: Plan) => ProtoObject;
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

class Forge {
  constructor(schema: Schema, prototypes?: Map<string, Proto>) {}
  attach: (name: string, ...prototypes: Proto[]) => void;
  get: (name: string) => { new (plan: Plan): ForgePrototype };
  has: (name: string) => boolean;
}

type TModule = (schema: Schema, options: Options, plan: Plan) => void;
type Plan = string | PlanCore | Schema;
class Schema extends ForgePrototype {
  forge: Forge;
  modules: Map<string, undefined>;
  warnings: Array<SchemaError>;
  tools: Tools;
  constructor(plan: Plan, options?: Options) {}
  pull: (name: string) => Schema | null;
  register: (name: string, module: TModule) => void;
  [key: string]: unknown;
}

export = Schema;
