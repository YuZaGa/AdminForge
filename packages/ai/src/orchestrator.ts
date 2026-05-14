import { type AdminForgeConfig, type CollectionDefinition } from "adminforge";
import { type DbClient } from "adminforge";
import { createController } from "adminforge/next";
import { z } from "zod";

/**
 * --- ContentAgent Orchestrator ---
 * A deterministic state machine for AI-assisted content creation.
 */
export class ContentAgent {
  constructor(
    private config: AdminForgeConfig,
    private db: DbClient
  ) {}

  /**
   * 1. Validate: Deterministic check against Zod schema
   */
  async validate(collectionName: string, data: Record<string, any>) {
    const collection = this.getCollection(collectionName);
    
    // Build validation schema from core field definitions
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const [name, field] of Object.entries(collection.fields)) {
      shape[name] = field.validation;
    }
    const schema = z.object(shape);

    const result = schema.safeParse(data);
    
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map(e => ({
          path: e.path.join("."),
          message: e.message
        }))
      };
    }

    return { valid: true, data: result.data };
  }

  /**
   * 2. Resolve: Handle relations (names -> IDs)
   */
  async resolveRelations(collectionName: string, data: Record<string, any>) {
    const collection = this.getCollection(collectionName);
    const resolvedData = { ...data };
    const unresolved: string[] = [];

    for (const [name, field] of Object.entries(collection.fields) as [string, any][]) {
      if (field.type === "relation") {
        const val = data[name];
        
        // If it's a raw string (not an ID), try to resolve it
        if (typeof val === "string" && val.length > 0 && !/^[a-z0-9]{25}$/.test(val)) {
          const targetCollection = field.ui.props?.to || field.db.references?.model;
          if (!targetCollection) continue;

          const targetCollectionDef = this.config.collections.find(c => c.name === targetCollection);
          if (!targetCollectionDef) continue;

          console.error(`[Orchestrator] Resolving relation for ${name}: "${val}"...`);
          
          // Build a safe query based on known common search fields
          const searchFields = ["name", "title", "label"].filter(f => targetCollectionDef.fields[f]);
          const orQuery = searchFields.map(f => ({ 
            [f]: { 
              contains: val,
              mode: "insensitive" 
            } 
          }));

          if (orQuery.length === 0) {
            unresolved.push(name);
            continue;
          }

          const results = await this.db.findMany(targetCollection, {
            where: { OR: orQuery },
            take: 1,
          });

          if (results.length > 0) {
            resolvedData[name] = (results[0] as any).id;
          } else {
            unresolved.push(name);
          }
        }
      }
    }

    return { resolvedData, unresolved };
  }

  /**
   * 3. Orchestrate: The main loop
   */
  async execute(prompt: string, collectionName: string, session: any) {
    const collection = this.getCollection(collectionName);
    console.error(`[ContentAgent] Orchestrating ${collectionName} for prompt: "${prompt}"`);

    return {
      status: "ready"
    };
  }

  /**
   * Helper to enrich the schema with AI hints for the agent.
   */
  getEnrichedSchema(collectionName: string) {
    const collection = this.getCollection(collectionName);

    return Object.entries(collection.fields).map(([name, field]: [string, any]) => ({
      name,
      type: field.type,
      required: field.meta?.required ?? false,
    }));
  }

  private getCollection(name: string): CollectionDefinition {
    const collection = this.config.collections.find((c) => c.name === name);
    if (!collection) throw new Error(`Collection ${name} not found`);
    return collection;
  }
}
