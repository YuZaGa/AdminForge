# Local Testing Guide

This guide explains how to test AdminForge packages on your local machine before publishing to NPM.

## Recommended Tool: `yalc`

While `npm link` is built-in, it often fails in complex monorepos due to issues with peer dependencies (like React) or symlink resolution. `yalc` is the professional alternative that mimics the actual `npm install` behavior by copying files to a local store.

### 1. Installation

```bash
npm install -g yalc
```

### 2. Publishing Locally (From AdminForge Repo)

First, build the packages, then publish them to the local yalc store:

```bash
# From the root of AdminForge
pnpm build

# Publish the core package
cd packages/adminforge
yalc publish --push

# Publish the AI package
cd ../ai
yalc publish --push
```

The `--push` flag ensures that any project already using this package via yalc will be updated immediately.

### 3. Using in a Test Project

Go to your external project (e.g., a new Next.js app) and add the packages:

```bash
yalc add adminforge
yalc add @adminforge/ai

# Install the actual dependencies
npm install
```

### 4. Updating

Whenever you make a change in AdminForge:

1. Edit the code.
2. Run `pnpm build`.
3. Run `yalc push` in the modified package directory.

Your test project will now have the latest version!

---

## Alternative: `pnpm link`

If you don't want to use `yalc`, you can use the built-in linking:

1. In `packages/adminforge`, run `pnpm link --global`.
2. In your test project, run `pnpm link --global adminforge`.

**Note:** This can cause "Duplicate React" errors if both your test project and AdminForge have React in their `node_modules`. `yalc` avoids this.
