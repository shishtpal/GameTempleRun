# Sky Relic Runner artwork

All A01–A10 groups from `generate_prompts.md` are supplied in `public/assets/generated/`: 18 raster files and four editable arrow SVGs. A01–A09 use the built-in `image_gen` tool; A10 uses the expressly preferred SVG alternative and matching WebP exports. The extra `fx-glow.webp` brings A07 to the four VFX sprites required by PRD §7.1.

The production images total **1,753,975 bytes (1.67 MiB)**, including the PNG concept and SVG sources. Generation source PNGs remain in the image tool's export directory and are not shipped in `public/`.

The prompt set is `generate_prompts.md`, with per-file descriptions, generation origin, source export names, size, alpha, SHA-256, palette and usage notes in `public/assets/manifest.json`. Refinements requested full transparent margins, an empty multiplier label area, and particle-only effects. A follow-up image edit replaced the explorer's scenery with a neutral studio background. No CLI image-generation API or third-party game artwork was used.

## Review and verification

From this game directory:

```sh
node tools/assets/serve_review.mjs
# Open http://127.0.0.1:8767/asset-review.html
python tools/assets/verify_assets.py
```

The verifier needs Pillow and numpy. The standalone review page decodes every raster and arrow SVG, checks raster dimensions, shows transparency on dark/checkered backgrounds, demonstrates real DOM title/2x labels, and repeats both albedo maps for visual seam review. `contact-sheet.jpg` is a compact offline preview outside the production asset payload.

To re-export from the original tool exports, use Python with Pillow (WebP enabled) and numpy:

```sh
python tools/assets/process_assets.py SOURCE_EXPORT_DIRECTORY
```

`sources.json` maps each asset to its original export filename. This command overwrites the normalized assets and manifest; it does not invoke image generation. Both 512px albedo textures use a 24px periodic boundary blend and lossless WebP so opposite decoded edge pixels match exactly. UI content is trimmed and centered with 6% padding; particle alpha is additionally feathered near the outer margin. The alpha channel comes from image_gen, not color-key background removal.

## Runtime integration

`src/render/GeneratedAssets.ts` provides a cached Three.js loader with sRGB color space, mipmapping, bounded anisotropy, repeat wrapping for albedos, optional-load failure handling and disposal. `assetUrl(name)` respects Vite's deployment base and can also be used for DOM images. Treat both material maps as albedo/color maps only. Keep material fallback colors when a texture load returns null.

Use the menu background and emblem behind real DOM title text. Overlay `2x` in DOM at the multiplier frame center. Use the four VFX maps on transparent SpriteMaterials with depthWrite disabled; additive blending suits sparkle/glow. The explorer PNG is a design reference for Box/Sphere/Cylinder geometry, never an animated model. Prefer SVG arrows in DOM and WebP arrows on Three.js billboards.

Full game wiring and gameplay verification remain blocked by the existing scaffold: no root `index.html`, `src/main.ts` imports nonexistent `./render/LightingSystem`, several files use an undefined runtime `THREE` namespace, the game calls a missing state `update()` method, UI calls a missing overlay `update()` method, and UI/simulation use separate GameState instances. There is no world mesh renderer to receive stone/brass maps yet. The standalone review is usable independently. These issues predate asset generation; repairing the game is outside this asset delivery.

`npm run check` already reported formatting errors in 16 existing files before these additions. `npm run build` already failed on the missing `index.html`. Asset verification and focused checks are recorded in the task's Asset Integrity section; project-wide failures must not be interpreted as gameplay validation.
