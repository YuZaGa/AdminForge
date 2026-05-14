import type { ZodSchema } from "zod";

export type RelationType = "many-to-one" | "one-to-many" | "many-to-many";

export interface FieldDBMapping {
  type: string;
  nullable?: boolean;
  unique?: boolean;
  default?: unknown;
  references?: { model: string; field: string };
  relationType?: RelationType;
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
  meta?: FieldMeta;
  hooks?: FieldHooks;
  access?: AccessConfig;
}

export interface FieldOptions {
  required?: boolean;
  default?: unknown;
  unique?: boolean;
  label?: string;
  hidden?: boolean;
  readOnly?: boolean;
  description?: string;
  access?: AccessConfig;
}

export interface FieldMeta {
  required: boolean;
  unique: boolean;
  default?: unknown;
  label?: string;
  hidden?: boolean;
  readOnly?: boolean;
  description?: string;
}

export interface TextOptions extends FieldOptions {}
export interface BooleanOptions extends FieldOptions {}
export interface RichTextOptions extends FieldOptions {}

export interface SlugOptions extends FieldOptions {
  from: string;
}

export interface RelationOptions extends FieldOptions {
  to: string;
  type: RelationType;
}

export interface DateOptions extends FieldOptions {
  autoCreate?: boolean;
  autoUpdate?: boolean;
}

export interface ImageOptions extends FieldOptions {}

export interface AccessConfig {
  read?: string[];
  create?: string[];
  update?: string[];
  delete?: string[];
}

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
  label: string;
  icon?: string;
  fields: Record<string, FieldDefinition>;
  hooks?: CollectionHooks;
  access?: AccessConfig;
}

export interface AuthConfig {
  enabled: boolean;
  provider?: "credentials";
  roles?: Record<string, { label?: string; parent?: string }>;
}

export interface AdminForgeConfig {
  collections: CollectionDefinition[];
  auth?: AuthConfig;
}

export type CollectionInput = Omit<CollectionDefinition, "fields"> & {
  fields: Record<string, FieldDefinition>;
  hooks?: CollectionHooks;
};
