# nano-banana

AI image generation plugin for Claude Code, powered by Google Gemini (Nano Banana 2 / Pro).

## Features

- **Image generation** with automatic prompt enhancement (Subject-Context-Style framework)
- **Image editing** with conversational iteration ("make it darker", "add a shadow")
- **Transparent PNGs** via difference matting (no FFmpeg needed, preserves semi-transparency)
- **Multi-reference images** for style transfer, color matching, dimension control
- **Character consistency** across multiple generations
- **Cost tracking** per generation, per model, with history
- **Flash and Pro models** with smart defaults

## Installation

From GitHub:
```bash
claude plugin add nano-banana@nano-banana
```

From local directory:
```bash
claude plugin add /path/to/nano-banana --scope user
```

## Configuration

Set your Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/apikey)):

**Option 1** -- Environment variable (recommended):
```bash
export GEMINI_API_KEY=your_key_here
```

**Option 2** -- Plugin .env file:
```bash
# After install, create .env in the plugin cache directory
echo "GEMINI_API_KEY=your_key" > ~/.nano-banana/.env
```

**Option 3** -- User config:
```bash
mkdir -p ~/.nano-banana
echo "GEMINI_API_KEY=your_key" > ~/.nano-banana/.env
```

The plugin checks for the key at session start and warns if missing.

## Usage

### Generate an image

```
/nb:generate "a minimal dark dashboard with analytics charts" --model flash --size 1K
```

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `--model` | flash, pro | flash | Flash = fast/cheap, Pro = high quality |
| `--aspect` | 1:1, 16:9, 9:16, 4:3, 3:4, etc. | 1:1 | Aspect ratio |
| `--size` | 512, 1K, 2K, 4K | 1K | Resolution |
| `--output` | path | auto | Output file path |
| `--no-enhance` | flag | off | Skip prompt enhancement |
| `--ref` | path (repeatable) | none | Reference images |
| `--consistent` | flag | off | Character consistency mode |

### Edit an image

```
/nb:edit last "make the background gradient blue to purple"
/nb:edit /path/to/image.png "remove the text and add a shadow"
```

Use `last` to edit the most recently generated image.

### Generate with transparency

```
/nb:transparent "a futuristic robot helmet icon" --size 1K
```

Uses difference matting: generates on white, edits to black, then extracts the alpha channel mathematically. Preserves semi-transparency (glass, shadows). Costs ~2x a normal generation.

### Enhance a prompt

```
/nb:enhance "cat on couch"
```

Outputs the enhanced prompt without generating an image.

### View costs

```
/nb:costs
```

Shows total spending, per-model breakdown, and recent history.

### List models

```
/nb:models
```

Shows available models with pricing.

## Skills

The plugin includes two auto-activating skills:

- **image-gen** -- Triggers when you ask Claude to generate, create, design, or illustrate any visual. Handles model selection, prompt enhancement, transparency, and output path decisions automatically.
- **image-edit** -- Triggers when you ask to modify, adjust, or iterate on an existing image. Resolves "last" automatically and supports reference images.

## How it works

### Prompt Enhancement

Every prompt is enriched via Gemini Flash (text-only) using the Subject-Context-Style framework before generation. This adds visual details (materials, lighting, camera) without changing the intent. Skip with `--no-enhance` for detailed prompts.

### Difference Matting (Transparency)

AI models can't generate true alpha channels. Instead of green screen (which causes halos), we use math:

1. Generate the subject on white background
2. Edit the same image to black background
3. Compare each pixel: if identical on both, it's opaque; if different, it's transparent

This preserves glass, smoke, shadows as proper semi-transparent pixels.

### Cost Tracking

Every API call logs token counts and estimated cost to `~/.nano-banana/costs.json`. Flash costs ~$0.07/image at 1K, Pro ~$0.13/image.

## Architecture

```
nano-banana/
├── .claude-plugin/          # Plugin manifest
├── lib/                     # Shared modules
│   ├── config.mjs           # Models, resolutions, pricing
│   ├── client.mjs           # Gemini API singleton
│   ├── prompt.mjs           # Prompt enhancement
│   ├── alpha.mjs            # Difference matting
│   ├── images.mjs           # Multi-ref image loading
│   ├── state.mjs            # Session state (~/.nano-banana/state.json)
│   ├── costs.mjs            # Cost tracking (~/.nano-banana/costs.json)
│   └── args.mjs             # CLI argument parser
├── scripts/                 # CLI scripts
│   ├── generate.mjs         # Image generation
│   ├── edit.mjs             # Image editing
│   ├── transparent.mjs      # Transparency workflow
│   ├── enhance.mjs          # Prompt enhancement
│   ├── costs.mjs            # Cost display
│   ├── models.mjs           # Model listing
│   └── validate.mjs         # SessionStart validation
├── skills/                  # Auto-activating skills
│   ├── image-gen/           # Generation skill + references
│   └── image-edit/          # Editing skill + references
├── commands/                # Slash commands
└── hooks/                   # SessionStart validation hook
```

## Migration from MCP

If you're using the `nanobanana-mcp-server` MCP server:

1. Install this plugin
2. Copy your `GEMINI_API_KEY` to `~/.nano-banana/.env`
3. Remove the `nanobanana` entry from your `.mcp.json`

This plugin replaces the MCP server with zero startup overhead and more features.

## License

MIT
