# Difference Matting -- Transparent Image Extraction

## The Problem
AI image models (including Nano Banana) cannot generate images with alpha channels. They always output flat PNGs with solid backgrounds.

## The Solution: Difference Matting

Instead of green screen (which causes halos and artifacts), we use a mathematical approach:

1. **Generate on white** -- subject on pure #FFFFFF background
2. **Edit to black** -- same subject, background changed to pure #000000
3. **Compare pixels** -- for each pixel:
   - Same on both -> 100% opaque (it's the subject)
   - Different -> partially/fully transparent (it's the background)
   - Formula: `alpha = 1 - (distance_between_pixels / max_distance)`

## Advantages Over Green Screen
- **Semi-transparency preserved** -- glass, smoke, shadows keep their alpha
- **No color halos** -- no green fringe around edges
- **No artifacts** -- black and white backgrounds are more stable than green
- **No external tools** -- only needs `sharp` (npm), no FFmpeg or ImageMagick

## Usage
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/transparent.mjs" "prompt" [options]
```

## Cost
~2x a normal generation (one generate + one edit API call).
