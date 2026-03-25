# nano-banana

Claude Code plugin for AI image generation via Google Gemini (Nano Banana 2 / Pro).

## Structure

- `lib/` — Shared modules (config, client, args, prompt enhancement, reverse engineering, alpha extraction, state, costs, image loading)
- `scripts/` — CLI scripts called by commands and skills (generate, edit, transparent, enhance, reverse, costs, models, validate)
- `skills/` — Auto-activating skills with SKILL.md + references/
- `commands/` — Slash commands (.md with YAML frontmatter)
- `hooks/` — SessionStart validation hook

## Patterns

- Scripts import from `../lib/` (relative paths)
- Structured output on stdout (pipe-delimited: `GENERATED | path:... | model:... | cost:...`)
- Errors on stderr, `process.exit(1)` on failure
- `${CLAUDE_PLUGIN_ROOT}` for portable paths in commands and hooks
- API key resolution: env var → plugin .env → ~/.nano-banana/.env

## API

Uses `@google/genai` SDK. Image generation via `models.generateContent()` with `responseModalities: ['TEXT', 'IMAGE']`.

## API Gotchas

- Image config key is `imageGenerationConfig` (NOT `imageConfig`) inside `config: {}`
- Model IDs: `gemini-3.1-flash-image-preview` (flash), `gemini-3-pro-image-preview` (pro)
- Prompt enhancement and reverse engineering use `gemini-3.1-flash-lite-preview` (text/vision, cheap)
- Reverse engineering uses vision input + text-only output (no `responseModalities` needed)
- `imageSize` accepts: `512x512`, `1024x1024`, `2048x2048`, `4096x4096`
- Response images are in `response.candidates[0].content.parts[]` where `part.inlineData.mimeType` starts with `image/`
- Token counts in `response.usageMetadata.promptTokenCount` and `candidatesTokenCount`

## Reference Repos (inspiration sources)

- [kingbootoshi/nano-banana-2-skill](https://github.com/kingbootoshi/nano-banana-2-skill) (223 stars) — Green screen transparency, multi-ref ordering semantics, cost tracking, 5-level API key fallback
- [shinpr/mcp-image](https://github.com/shinpr/mcp-image) (86 stars, 203 commits) — Prompt optimization (Subject-Context-Style), quality presets, security patterns, Google Search grounding
- [ConechoAI/Nano-Banana-MCP](https://github.com/ConechoAI/Nano-Banana-MCP) (133 stars) — Session-aware editing (continue_editing), platform-aware storage
- [YCSE/nanobanana-mcp](https://github.com/YCSE/nanobanana-mcp) (18 stars) — Conversation ID, image history referencing ("last", "history:N")
- [flight505/nano-banana](https://github.com/flight505/nano-banana) — Video (Veo 3.1), diagrams (Kroki), PostToolUse quality hooks
- [guinacio/claude-image-gen](https://github.com/guinacio/claude-image-gen) — Hybrid skill+MCP, dynamic model discovery
- Transparency technique: Julien De Luca's difference matting — white+black passes, alpha extraction via pixel math

## Rules

- Never commit `.env` (contains API key)
- Never hardcode absolute paths (use `${CLAUDE_PLUGIN_ROOT}`)
- Test scripts with `node scripts/<name>.mjs` from plugin root
