# Multi-Reference Images & Character Consistency

## Multi-Reference (--ref)

Pass reference images to guide generation. Ordering matters:

1. **First image** = dominant style influence
2. **Subsequent images** = modifiers (colors, textures, details)

### Use Cases

- **Style transfer**: `--ref style-reference.png` -> "generate a product shot in this style"
- **Color matching**: `--ref brand-colors.png` -> "match these brand colors"
- **Dimension control**: `--ref blank-256x256.png` -> forces exact output dimensions
- **Combination**: `--ref style-a.png --ref colors-b.png` -> merge style A with palette B

### Tips
- Reference images are sent as base64 inline data before the text prompt
- The model interprets them as visual context, not instructions
- Works with both generate.mjs and edit.mjs

## Character Consistency (--consistent)

Maintains the same character appearance across multiple generations.

### How It Works
1. First generation with `--consistent`: generates the character, stores the description in `~/.nano-banana/state.json` as `characterDescription`
2. Subsequent generations with `--consistent`: re-injects the stored description into the prompt automatically
3. The model adds "Maintain consistent character appearance with distinctive visual markers"

### Workflow Example
```bash
# First: establish the character
generate.mjs "a robot mascot with blue eyes and golden armor" --consistent
# Second: same character in different context
generate.mjs "the same robot exploring a garden" --consistent
# Third: same character doing something else
generate.mjs "the same robot reading a book at a desk" --consistent
```

### Limitations
- Works best within a single session (state.json persists)
- Character description is text-based; subtle visual details may drift
- For best results, use `--ref` with a previously generated image + `--consistent`
