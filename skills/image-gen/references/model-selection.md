# Model Selection Guide

## Flash (Nano Banana 2) -- Default
- Model: `gemini-3.1-flash-image-preview`
- Speed: ~5-10 seconds
- Cost: ~$0.067/image (1K)
- Best for: Quick iterations, mockups, UI assets, icons, logos, social media

## Pro (Nano Banana Pro)
- Model: `gemini-3-pro-image-preview`
- Speed: ~15-30 seconds
- Cost: ~$0.134/image (1K)
- Best for: Complex scenes, precise text, photorealistic, final deliverables

## Resolution Pricing

| Resolution | Flash | Pro |
|-----------|-------|-----|
| 512 | $0.045 | N/A (min 1K) |
| 1K | $0.067 | $0.134 |
| 2K | $0.101 | $0.202 |
| 4K | $0.151 | $0.302 |

## Decision Heuristic
- Default to flash. Switch to pro only when quality matters more than speed.
- For transparency (transparent.mjs): cost is ~2x (two API calls).
