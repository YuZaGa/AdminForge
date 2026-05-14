export { defineConfig } from "./schema/config.js";
export { collection } from "./schema/collection.js";
export { normalize } from "./schema/normalize.js";
export type { NormalizedSchema } from "./schema/normalize.js";
export { fields } from "./fields/index.js";
export { registerField, getField, getRegisteredFields, clearRegistry } from "./registry/index.js";
export {
  executeBeforeCreate,
  executeAfterCreate,
  executeBeforeUpdate,
  executeAfterUpdate,
  executeBeforeDelete,
  executeAfterDelete,
} from "./hooks/index.js";
export type {
  FieldDefinition,
  FieldDBMapping,
  FieldUI,
  FieldHooks,
  FieldMeta,
  CollectionDefinition,
  CollectionHooks,
  AdminForgeConfig,
  AuthConfig,
  AccessConfig,
  RelationType,
  TextOptions,
  BooleanOptions,
  RichTextOptions,
  SlugOptions,
  RelationOptions,
  DateOptions,
  ImageOptions,
} from "./types/index.js";

/**
 * Utility type to infer the record structure from a CollectionDefinition.
 */
export type InferRecord<T extends { fields: Record<string, any> }> = {
  id: string;
} & {
  [K in keyof T["fields"]]: any; // We'll refine this in the future with proper field-to-type mapping
};
