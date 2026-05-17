# @adminforge/ai

## 0.3.1

### Patch Changes

- Updated dependencies [4a217a9]
  - @adminforge/core@0.3.1

## 0.3.0

### Minor Changes

- Refined Developer Experience (DX) for Zero-Config projects:
  - Added `serializeConfig` utility for Next.js Server Components.
  - Automatic route parameter detection (`admin`, `slug`, etc.).
  - Default SQLite database provisioning when `DATABASE_URL` is missing.
  - Fixed AI CLI executable permissions and dependencies.

### Patch Changes

- Updated dependencies
  - @adminforge/core@0.3.0

## 0.2.0

### Minor Changes

- 473b0a5: Added high-level helpers, CLI migrate command, and media upload support.
- 9ddaafa: Initial public release of the AdminForge ecosystem. Includes unified core framework and AI orchestration layer.

### Patch Changes

- Critical DX refinements:
  - Added `serializeConfig` to handle Zod schema serialization in Next.js.
  - Improved API route flexibility by auto-detecting catch-all param names.
  - Optimized Zero-Config setup by defaulting to local SQLite if DATABASE_URL is missing.
  - Fixed AI CLI executable permissions and internal import paths.
- Updated dependencies [473b0a5]
- Updated dependencies
- Updated dependencies [9ddaafa]
  - @adminforge/core@0.2.0
