import type { FieldDefinition } from "../types/index.js";

const fieldRegistry = new Map<string, FieldDefinition>();

export function registerField(name: string, definition: FieldDefinition): void {
  if (fieldRegistry.has(name)) {
    throw new Error(`Field "${name}" is already registered`);
  }
  fieldRegistry.set(name, definition);
}

export function getField(name: string): FieldDefinition | undefined {
  return fieldRegistry.get(name);
}

export function getRegisteredFields(): Map<string, FieldDefinition> {
  return new Map(fieldRegistry);
}

export function clearRegistry(): void {
  fieldRegistry.clear();
}
