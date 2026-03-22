---
name: image-edit
description: This skill should be used when the user wants to edit, modify, adjust, iterate on, refine, or change an existing image. Also triggers on "change the background", "make it more", "remove", "add to this image", "restyle". Covers image editing, iterative refinement, and difference matting transparency extraction.
---

# Image Editing

Edit existing images via Gemini.

## Quick Start

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/edit.mjs" "path_or_last" "instructions" [options]
```

## Resolving the Source Image

- If path is `last`: reads the last generated image from `~/.nano-banana/state.json`
- Otherwise: use the absolute or relative path to the image

## Options

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--model` | flash, pro | flash | Model to use |
| `--output` | path | auto | Output path |
| `--ref` | path (repeatable) | none | Additional reference images |

## Common Editing Patterns

Consult `references/editing-patterns.md` for detailed workflows.
Consult `references/transparency.md` for difference matting transparency technique.

## Iteration Workflow

1. Generate an image -> auto-saved as "last"
2. User says "make the background darker" -> `edit.mjs last "make the background darker"`
3. User says "now add a shadow" -> `edit.mjs last "add a subtle shadow below the object"`
4. Each edit updates "last", enabling natural conversation flow
