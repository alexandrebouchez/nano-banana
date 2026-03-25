---
name: image-reverse
description: "This skill should be used when the user wants to reverse-engineer, analyze, describe, extract a prompt from, recreate, clone, or reproduce an existing image. Also triggers on 'what prompt', 'how was this made', 'image to prompt', 'reverse engineer', 'recreate this', 'clone this image', 'reproduce this'."
---

# Image Reverse Engineering (Image to Prompt)

Extract a ready-to-use generation prompt from an existing image.

## Quick Start

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/reverse.mjs" "/path/to/image.png"
```

With auto-generation (reverse + generate in one step):

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/reverse.mjs" "/path/to/image.png" --generate
```

## Options

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| (positional) | path or `last` | required | Source image path, or `last` to use the last generated image |
| `--generate` | flag | off | Auto-generate a new image from the extracted prompt |
| `--model` | flash, pro | flash | Model for auto-generation (only with `--generate`) |
| `--output` | path | auto | Output path for auto-generation (only with `--generate`) |

## Source Image

- **Path**: Any supported image format (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`)
- **`last`**: Uses the last generated/edited image from `~/.nano-banana/state.json`

## Chaining Workflow

The extracted prompt is saved to `state.lastPrompt`, enabling natural chaining:

1. **Reverse**: `reverse.mjs /path/to/image.png` — extracts prompt, saves to state
2. **Generate**: `generate.mjs "the extracted prompt"` — regenerates with the prompt

Or use `--generate` to do both in one step (passes `--no-enhance` since the prompt is already optimized).

## Use Cases

- **Image cloning**: Reverse an image, then generate to create a similar version
- **Prompt learning**: Understand what prompt structure would produce a given style
- **Style extraction**: Extract style description from a reference, reuse with new subjects
- **Iteration**: Reverse an existing image, tweak the prompt, regenerate

## Output Format

```
REVERSED | prompt:<extracted_prompt> | model:gemini-3.1-flash-lite-preview | cost:$0.0012 | source:/path/to/image.png
```

When `--generate` is used, a second line follows with the generation output:

```
GENERATED | path:/path/to/output.png | model:flash | cost:$0.0042 | 1024x1024
```

## Cost

Reverse analysis is very cheap (~$0.001-0.005 per image, text-only model). With `--generate`, add the normal image generation cost.
