import { z } from "zod";
import type {
  FieldDefinition,
  TextOptions,
  BooleanOptions,
  RichTextOptions,
  SlugOptions,
  RelationOptions,
  DateOptions,
  ImageOptions,
} from "../types/index.js";

function text(options: TextOptions = {}): FieldDefinition {
  return {
    type: "text",
    db: {
      type: "String",
      nullable: !options.required,
      unique: options.unique,
      default: options.default,
    },
    ui: {
      component: "text",
      props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly },
    },
    validation: options.required ? z.string().min(1) : z.string().optional(),
  };
}

function boolean(options: BooleanOptions = {}): FieldDefinition {
  return {
    type: "boolean",
    db: {
      type: "Boolean",
      nullable: !options.required,
      default: options.default ?? false,
    },
    ui: {
      component: "boolean",
      props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly },
    },
    validation: options.required ? z.boolean() : z.boolean().optional(),
  };
}

function richText(options: RichTextOptions = {}): FieldDefinition {
  return {
    type: "richText",
    db: {
      type: "String",
      nullable: !options.required,
    },
    ui: {
      component: "richText",
      props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly },
    },
    validation: options.required ? z.string().min(1) : z.string().optional(),
  };
}

function slug(options: SlugOptions): FieldDefinition {
  return {
    type: "slug",
    db: {
      type: "String",
      nullable: !options.required,
      unique: options.unique ?? true,
    },
    ui: {
      component: "slug",
      props: { from: options.from, label: options.label, hidden: options.hidden, readOnly: options.readOnly },
    },
    validation: options.required
      ? z.string().regex(/^[a-z0-9-]+$/)
      : z.string().regex(/^[a-z0-9-]+$/).optional(),
    hooks: {
      beforeSave: (value: unknown) => {
        if (typeof value === "string") {
          return value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        }
        return value;
      },
    },
  };
}

function relation(options: RelationOptions): FieldDefinition {
  return {
    type: "relation",
    db: {
      type: options.type === "many-to-many" ? "String" : "String",
      nullable: !options.required,
      references: { model: options.to, field: "id" },
    },
    ui: {
      component: "relation",
      props: {
        to: options.to,
        relationType: options.type,
        label: options.label,
        hidden: options.hidden,
        readOnly: options.readOnly,
      },
    },
    validation: options.required ? z.string() : z.string().optional(),
  };
}

function date(options: DateOptions = {}): FieldDefinition {
  return {
    type: "date",
    db: {
      type: "DateTime",
      nullable: !options.required,
    },
    ui: {
      component: "date",
      props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly },
    },
    validation: options.required ? z.string().datetime().optional() : z.string().datetime().optional(),
    hooks: {
      beforeSave: (value: unknown) => {
        if (options.autoCreate && !value) {
          return new Date().toISOString();
        }
        return value;
      },
    },
  };
}

function image(options: ImageOptions = {}): FieldDefinition {
  return {
    type: "image",
    db: {
      type: "String",
      nullable: true,
    },
    ui: {
      component: "image",
      props: { label: options.label, hidden: options.hidden, readOnly: options.readOnly },
    },
    validation: z.string().optional(),
  };
}

export const fields = {
  text,
  boolean,
  richText,
  slug,
  relation,
  date,
  image,
} as const;
