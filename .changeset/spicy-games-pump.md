---
"@adminforge/core": patch
---

Fix build-time crash: defer ADMINFORGE_SECRET validation to runtime instead of module load time. This allows Next.js builds to complete without requiring the env var during static page generation.
