# Subject-Context-Style Prompt Framework

The prompt enhancement system enriches user prompts before generation.

## The Three Pillars

### SUBJECT (What)
- Physical characteristics, textures, materials, colors
- Scale, proportions, distinctive features
- Expressions, poses, states (for characters/objects)

### CONTEXT (Where/When)
- Setting, environment, background
- Lighting (direction, quality, color temperature)
- Time of day, weather, atmosphere
- Spatial relationships (foreground/midground/background)

### STYLE (How)
- Artistic approach (photorealistic, illustration, minimal, etc.)
- Camera specs (if photographic: lens, aperture, distance)
- Color palette, mood, emotional tone
- Rendering technique (3D, flat, watercolor, etc.)

## When Enhancement Helps Most
- Short prompts ("a cat") -> adds visual richness
- Vague prompts ("something cool") -> adds specificity
- Technical prompts ("dashboard UI") -> adds design context

## When to Skip Enhancement (--no-enhance)
- User provides 100+ word detailed prompt
- User is iterating on a specific detail
- User wants exact literal output
