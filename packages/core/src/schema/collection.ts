import type { CollectionDefinition, CollectionInput } from "../types/index.js";

export function collection(input: CollectionInput): CollectionDefinition {
  return {
    name: input.name,
    label: input.label ?? input.name.charAt(0).toUpperCase() + input.name.slice(1),
    icon: input.icon,
    fields: input.fields,
    hooks: input.hooks,
    access: input.access,
  };
}
