/**
 * --- AI Hints Layer ---
 * This layer allows developers to provide guidance to AI agents 
 * without modifying the core system schema.
 */

export type AIFieldHint = {
  description?: string;
  style?: string;
  examples?: string[];
};

export type AICollectionHints = {
  description?: string;
  fields?: Record<string, AIFieldHint>;
};

export type AIHintsConfig = Record<string, AICollectionHints>;

/**
 * Utility to define AI hints for a project.
 */
export function defineAIHints(hints: AIHintsConfig): AIHintsConfig {
  // We can add validation here in the future if needed
  return hints;
}

/**
 * Fallback hints for fields that don't have explicit guidance.
 */
export const DEFAULT_HINTS: AIFieldHint = {
  style: "professional, neutral, informative",
};

/**
 * Helper to merge core schema with AI hints.
 */
export function mergeHints(collectionName: string, fieldName: string, hints: AIHintsConfig): AIFieldHint {
  const collectionHints = hints[collectionName];
  const fieldHint = collectionHints?.fields?.[fieldName];
  
  return {
    ...DEFAULT_HINTS,
    ...fieldHint,
  };
}
