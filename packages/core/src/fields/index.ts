import { z } from "zod";
import type {
  FieldDefinition,
  FieldMeta,
  FieldOptions,
  TextOptions,
  BooleanOptions,
  RichTextOptions,
  SlugOptions,
  RelationOptions,
  DateOptions,
  ImageOptions,
} from "../types/index.js";

function fieldMeta(options: FieldOptions = {}): FieldMeta {
  return {
    required: Boolean(options.required),
    unique: Boolean(options.unique),
    default: options.default,
    label: options.label,
    hidden: options.hidden,
    readOnly: options.readOnly,
    description: options.description,
  };
}

function text(options: TextOptions = {}): FieldDefinition {
  return {
    type: "text",
    db: { type: "String", nullable: !options.required, unique: options.unique, default: options.default },
    access: options.access,
    ui: { component: "text", props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly } },
    validation: options.required ? z.string().min(1) : z.string().optional(),
    meta: fieldMeta(options),
  };
}

function boolean(options: BooleanOptions = {}): FieldDefinition {
  return {
    type: "boolean",
    db: { type: "Boolean", nullable: !options.required, default: options.default ?? false },
    access: options.access,
    ui: { component: "boolean", props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly } },
    validation: options.required ? z.boolean() : z.boolean().optional(),
    meta: fieldMeta(options),
  };
}

function richText(options: RichTextOptions = {}): FieldDefinition {
  return {
    type: "richText",
    db: { type: "String", nullable: !options.required },
    access: options.access,
    ui: { component: "richText", props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly } },
    validation: options.required ? z.string().min(1) : z.string().optional(),
    meta: fieldMeta(options),
  };
}

function slug(options: SlugOptions): FieldDefinition {
  return {
    type: "slug",
    db: { type: "String", nullable: !options.required, unique: options.unique ?? true },
    access: options.access,
    ui: { component: "slug", props: { from: options.from, label: options.label, hidden: options.hidden, readOnly: options.readOnly } },
    validation: options.required
      ? z.string().regex(/^[a-z0-9-]+$/)
      : z.string().regex(/^[a-z0-9-]+$/).optional(),
    hooks: { beforeSave: (value: unknown) => {
      if (typeof value === "string") return value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      return value;
    }},
    meta: { ...fieldMeta(options), unique: options.unique ?? true },
  };
}

function relation(options: RelationOptions): FieldDefinition {
  const isMulti = options.type === "many-to-many" || options.type === "one-to-many";
  return {
    type: "relation",
    db: { type: "String", nullable: !options.required, references: { model: options.to, field: "id" }, relationType: options.type },
    access: options.access,
    ui: { component: "relation", props: { to: options.to, relationType: options.type, label: options.label, hidden: options.hidden, readOnly: options.readOnly } },
    validation: isMulti
      ? (options.required ? z.array(z.string()).min(1) : z.array(z.string()).optional())
      : (options.required ? z.string().min(1) : z.string().optional()),
    meta: fieldMeta(options),
  };
}

function date(options: DateOptions = {}): FieldDefinition {
  return {
    type: "date",
    db: { type: "DateTime", nullable: !options.required },
    access: options.access,
    ui: { component: "date", props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly } },
    validation: options.required ? z.string().datetime() : z.string().datetime().optional(),
    hooks: { beforeSave: (value: unknown) => {
      if (options.autoCreate && !value) return new Date().toISOString();
      return value;
    }},
    meta: fieldMeta(options),
  };
}

function image(options: ImageOptions = {}): FieldDefinition {
  return {
    type: "image",
    db: { type: "String", nullable: true },
    access: options.access,
    ui: { component: "image", props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly } },
    validation: z.string().optional(),
    meta: fieldMeta(options),
  };
}

export const fields = {
  text, boolean, richText, slug, relation, date, image,
} as const;
