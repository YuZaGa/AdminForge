import type { ZodSchema } from "zod";

export interface FieldDBMapping {
  type: string;
  nullable?: boolean;
  unique?: boolean;
  default?: unknown;
  references?: { model: string; field: string };
}

export interface FieldUI {
  component: string;
  props?: Record<string, unknown>;
}

export interface FieldHooks {
  beforeValidate?: (value: unknown) => unknown;
  beforeSave?: (value: unknown) => unknown;
}

export interface FieldDefinition {
  type: string;
  db: FieldDBMapping;
  ui: FieldUI;
  validation: ZodSchema;
  hooks?: FieldHooks;
}

export interface FieldOptions {
  required?: boolean;
  default?: unknown;
  unique?: boolean;
  label?: string;
}

export interface TextOptions extends FieldOptions {}
export interface BooleanOptions extends FieldOptions {}
export interface RichTextOptions extends FieldOptions {}

export interface SlugOptions extends FieldOptions {
  from: string;
}

export interface RelationOptions extends FieldOptions {
  to: string;
  type: "many-to-one" | "one-to-many" | "many-to-many";
}

export interface DateOptions extends FieldOptions {
  autoCreate?: boolean;
  autoUpdate?: boolean;
}

export interface ImageOptions extends FieldOptions {}

export interface CollectionHooks {
  beforeCreate?: (ctx: { data: Record<string, unknown> }) => Record<string, unknown> | Promise<Record<string, unknown>>;
  afterCreate?: (ctx: { data: Record<string, unknown>; id: string }) => void | Promise<void>;
  beforeUpdate?: (ctx: { data: Record<string, unknown>; id: string }) => Record<string, unknown> | Promise<Record<string, unknown>>;
  afterUpdate?: (ctx: { data: Record<string, unknown>; id: string }) => void | Promise<void>;
  beforeDelete?: (ctx: { id: string }) => void | Promise<void>;
  afterDelete?: (ctx: { id: string }) => void | Promise<void>;
}

export interface CollectionDefinition {
  name: string;
  label?: string;
  fields: Record<string, FieldDefinition>;
  hooks?: CollectionHooks;
}

export interface AuthConfig {
  enabled: boolean;
  provider?: "credentials";
}

export interface AdminForgeConfig {
  collections: CollectionDefinition[];
  auth?: AuthConfig;
}

export type CollectionInput = Omit<CollectionDefinition, "fields"> & {
  fields: Record<string, FieldDefinition>;
  hooks?: CollectionHooks;
};
