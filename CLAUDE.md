# nano-banana

Claude Code plugin for AI image generation via Google Gemini (Nano Banana 2 / Pro).

## Structure

- `lib/` — Shared modules (config, client, args, prompt enhancement, alpha extraction, state, costs, image loading)
- `scripts/` — CLI scripts called by commands and skills (generate, edit, transparent, enhance, costs, models, validate)
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

## Rules

- Never commit `.env` (contains API key)
- Never hardcode absolute paths (use `${CLAUDE_PLUGIN_ROOT}`)
- Test scripts with `node scripts/<name>.mjs` from plugin root
