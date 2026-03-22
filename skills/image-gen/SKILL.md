---
name: image-gen
description: This skill should be used when the user asks to generate, create, design, illustrate, or make an image, visual, icon, logo, banner, mockup, screenshot, or any visual asset. Also triggers on "transparent", "sans fond", "detour", "style transfer", "reference image", "consistant", "character consistency". Covers text-to-image generation, transparency via difference matting, multi-reference style transfer, and character consistency.
---

# Image Generation

Generate images via Gemini Nano Banana 2 (Flash) or Pro.

## Quick Start

Generate an image:
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/generate.mjs" "prompt" [options]
```

Generate with transparency (difference matting):
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/transparent.mjs" "prompt" [options]
```

## Options

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--model` | flash, pro | flash | Flash = fast/cheap, Pro = high quality |
| `--aspect` | 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 4:5, 5:4, 21:9, 1:4, 1:8, 4:1, 8:1 | model default | Aspect ratio |
| `--size` | 512, 1K, 2K, 4K | 1K | Resolution |
| `--output` | path | auto-generated | Output file path |
| `--no-enhance` | flag | off | Skip prompt enhancement |
| `--ref` | path (repeatable) | none | Reference images for style transfer |
| `--consistent` | flag | off | Maintain character consistency across generations |

## Decision Tree

1. **User wants transparency** (transparent, sans fond, detour, alpha, icon on no background) -> Use `transparent.mjs`
2. **User wants style transfer** (like this image, in the style of, match these colors) -> Use `generate.mjs --ref path`
3. **User wants character consistency** (same character, consistent look) -> Use `generate.mjs --consistent`
4. **Standard generation** -> Use `generate.mjs`

## Model Selection

- **flash** (default): Fast, cheap (~$0.067/image at 1K). Good for iteration, mockups, quick visuals.
- **pro**: Higher quality (~$0.134/image at 1K). Use for: complex scenes, precise text rendering, final assets, detailed illustrations.

## Output Path

Save images in a contextually appropriate location:
- If working in a client folder (e.g., Clients/Dentalsoft/): save there
- If working in Design/: save there
- If no clear context: user's current working directory
- Always use descriptive filenames derived from the prompt (e.g., `dashboard-mockup-dark.png`)

## Prompt Enhancement

Enhancement is active by default. It uses the Subject-Context-Style framework to enrich prompts automatically. Skip with `--no-enhance` if the user provides a very detailed prompt.

Consult `references/prompt-framework.md` for the full framework.
Consult `references/model-selection.md` for detailed model comparison.
Consult `references/multi-ref-guide.md` for multi-reference and character consistency patterns.
