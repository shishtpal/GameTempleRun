# Sky Relic Runner - Asset Generation Prompts
*PRD v1.0 §7.1-7.4: generate_image prompts for all P0/P1 asset batches*

## Global Art Direction Prefix (use for ALL prompts):
> Original stylized 3D adventure game art, floating sky ruins, warm golden-hour lighting, weathered sandstone, oxidized brass, luminous turquoise crystals, crisp silhouettes, readable colors, cohesive painterly low-poly aesthetic, no copyrighted characters, no logo, no watermark, no letters.

---

## A01 - Main-Menu Illustration (P0)
**Priority:** P0  
**Format:** Wide image → optimized WebP  
**Intended use:** Title/menu background  

**Prompt:**
> Wide cinematic view of an original floating stone sky-bridge stretching toward ancient aerial ruins above sunlit clouds, brass gears, glowing turquoise relics, atmospheric depth, strong clear center composition with negative space reserved for title and buttons, stylized premium 3D adventure game environment, no characters, no text, no watermark, 16:9.

**Expected output filename:** `menu-sky-ruins.webp`  
**Dimensions:** 16:9 widescreen (e.g., 1920x1080 or 1280x720)  
**Processing:** Optimize to WebP with alpha channel preserved for menu UI overlay

---

## A02 - Stone Texture (P0)
**Priority:** P0  
**Format:** Square texture  
**Intended use:** Bridge/ruins material (albedo)  

**Prompt:**
> Square orthographic seamless-looking stylized game texture of worn honey-colored carved sandstone blocks with subtle cracks and mortar, diffuse/albedo appearance, uniform flat lighting, no cast shadows, no objects, no perspective, no text, 1:1. After generation, correct edges and verify tiling programmatically.

**Expected output filename:** `stone-albedo.webp`  
**Dimensions:** 1:1 square (e.g., 512x512 or 1024x1024)  
**Processing:** Verify tiling by checking edge seam match; crop/seam-fix if needed

---

## A03 - Brass/Metal Surface (P0)
**Priority:** P0  
**Format:** Square texture or detail mask  
**Intended use:** Trap and machinery material  

**Prompt:**
> Square orthographic stylized game texture of weathered oxidized brass plates with embossed gear patterns and corrosion accents, diffuse/albedo appearance, uniform flat lighting, no perspective, no objects, no text, 1:1.

**Expected output filename:** `brass-embossed.webp`  
**Dimensions:** 1:1 square (e.g., 512x512)  
**Processing:** Can be used as albedo mask combined with A02 stone texture for varied machinery

---

## A04 - Sky/Cloud Backdrop (P0)
**Priority:** P0  
**Format:** Wide image  
**Intended use:** Atmospheric background  

**Prompt:**
> Wide panoramic view of original floating islands and cloud seas at golden hour, warm sunset lighting, stylized low-poly terrain silhouettes against sky, faint distant relics glowing turquoise, atmospheric perspective, no ground-level geometry, no characters, no text, 21:9 cinematic aspect.

**Expected output filename:** `sky-islands.webp`  
**Dimensions:** 21:9 or 16:9 wide (e.g., 1920x816 or 1280x512)  
**Processing:** Use as skybox/background material; extract color palette for level design

---

## A05 - Shard Collectible Icon (P0)
**Priority:** P0  
**Format:** Transparent background; trim and center  
**Intended use:** HUD and pickup billboard reference  

**Prompt:**
> Single luminous turquoise diamond-like relic shard for a stylized mobile adventure game HUD, centered, full silhouette in frame, clean readable shape, transparent background, no shadow outside subject, no text or watermark, 1:1.

**Expected output filename:** `relic-shard.webp`  
**Dimensions:** 1:1 square (e.g., 256x256) with full transparency  
**Processing:** Center the subject, remove background, ensure crisp alpha edges; use as HUD billboard and pickup pickup visual

---

## A06 - Power-Up Icons (P0)
**Priority:** P0  
**Format:** Transparent images; normalize sizes and alpha  
**Intended use:** Power-up HUD  

**Prompts (separate calls for each):**

**Shield icon:**
> Single polished shield power-up icon made of weathered brass with a turquoise glowing core, stylized casual game UI, centered object, crisp silhouette, transparent background, no words, no watermark, 1:1.

**Magnet icon:**
> Single stylized magnet power-up icon with flowing loop design and turquoise accent highlights, centered object, crisp silhouette, transparent background, no words, no watermark, 1:1.

**Multiplier icon:**
> Single 2x multiplier power-up icon with bold numerical "2x" center label surrounded by brass framework, centered object, crisp silhouette, transparent background; **render numerical 2x label in HTML/CSS rather than relying on AI text accuracy**, 1:1.

**Expected output filenames:**
- `shield-icon.webp` (brass+turquoise core)
- `magnet-icon.webp` (flowing loop design)
- `multiplier-icon.webp` (2x framework)

**Dimensions:** 1:1 square (e.g., 256x256) with full transparency  
**Processing:** Normalize sizes; extract individual icons from combined generation if using atlas approach; HTML/CSS for 2x label

---

## A07 - VFX Sprites (P0)
**Priority:** P0  
**Format:** 4–8 separate RGBA sprites or validated atlas  
**Intended use:** Particle/VFX textures  

**Prompts (separate calls for each):**

**Sparkle burst:**
> Single soft circular magical turquoise sparkle burst for a game particle texture, centered, bright core, smooth alpha fade at edges, isolated on fully transparent background, no words, 1:1.

**Dust puff:**
> Single dust puff cloud sprite for game particle, centered, soft edges, slightly ellipsoid shape, isolated on fully transparent background, no words, 1:1.

**Motion streak:**
> Single directional motion streak sprite for speed effect, centered, elongated horizontal shape, gradient from opaque to transparent, isolated on fully transparent background, no words, 1:1.

**Expected output filenames:**
- `fx-sparkle.webp` (magical turquoise burst)
- `fx-dustpuff.webp` (cloud-like particle)
- `fx-streak.webp` (horizontal motion streak)

**Dimensions:** 1:1 square (e.g., 128x128 or 256x256) with full RGBA transparency  
**Processing:** Each sprite centered in frame; can be combined into CSS sprite atlas or used individually per particle type

---

## A08 - Explorer Concept Reference (P1)
**Priority:** P1  
**Format:** Concept only; convert into procedural original 3D character  
**Intended use:** Style/shape reference for 3D character  

**Prompt:**
> Original cheerful explorer in a short scarf, goggles, sturdy boots, small satchel, turquoise accents, stylized low-poly-friendly proportions, full-body three-quarter view, neutral clear background, simple construction suitable for recreation with Three.js primitive geometry, no resemblance to any existing game hero, no words.

**Expected output filename:** `explorer-concept.png`  
**Dimensions:** 3/4 view portrait (e.g., 512x768 or 768x512)  
**Processing:** Use as style reference only; convert into procedural Three.js geometry (Box/Sphere/Cylinder composition) with texture overlay; do NOT use as animated model directly

---

## A09 - Title Emblem (P1)
**Priority:** P1  
**Format:** Transparent image; overlay real text in DOM  
**Intended use:** Menu polish  

**Prompt:**
> Original stylized game title emblem with decorative rune motifs and turquoise accent flourishes, centered composition, transparent background, no letters/numbers embedded; real title text to be overlaid via HTML/CSS later, 1:1.

**Expected output filename:** `title-emblem.webp`  
**Dimensions:** 1:1 square (e.g., 512x512) with full transparency  
**Processing:** Generate emblem without text; overlay "Sky Relic Runner" title via HTML/CSS in menu; use for background decoration

---

## A10 - Warning Arrows/Runes (P1)
**Priority:** P1  
**Format:** Transparent sprites or CSS/SVG if clearer  
**Intended use:** Turn indicators and scenery  

**Prompt:**
> Set of 4 transparent directional arrow runes for turn indicators: north, east, south, west arrows with ancient carved rune patterns, turquoise glow accents, crisp silhouettes, fully transparent backgrounds, no overlapping elements, suitable for CSS sprite sheet, 1:1 per arrow.

**Expected output filenames:**
- `arrow-north.webp`
- `arrow-east.webp`
- `arrow-south.webp`
- `arrow-west.webp`

**Dimensions:** 1:1 square per arrow (e.g., 128x128) with full RGBA transparency  
**Processing:** Can be combined into single sprite sheet; or use CSS/SVG arrows as alternative (preferred for clarity per PRD §7.4)

---

## Usage Notes

### If `generate_image` Tool Succeeds:
1. Run each prompt through the environment's `generate_image` tool
2. Save outputs to `public/assets/generated/` with the expected filenames above
3. Run `npm run check` to verify formatting
4. Optimize WebP files for web use
5. Integrate via `THREE.TextureLoader` or HTML/CSS as specified
6. Update `public/assets/manifest.json` with each asset's filename, type, use, prompt, origin, dimensions, transparency, and license/notes

### If `generate_image` Tool Fails (Procedural Fallbacks per PRD §9):
1. Use Canvas/SVG to generate equivalent assets
2. Surface textures: Generate via JavaScript Canvas with noise patterns and color gradients
3. Icons: Generate via SVG with crisp paths and transparent backgrounds
4. Character concepts: Convert to Three.js primitive geometry (Box/Sphere/Cylinder composition)
5. Document all fallbacks in `Tasks.md` Asset Integrity section
6. All procedural assets must maintain the cohesive art style: honey-colored sandstone, oxidized brass, luminous turquoise, warm golden-hour lighting, crisp silhouettes

### Asset Integrity (PRD §9.3-9.4):
- All local assets must be original (no copyrighted Temple Run artwork, music, names or characters)
- All generated/watermark-free outputs
- Color palette consistency across all asset batches
- Transparency preservation for UI/HUD assets
- Document prompt-style descriptions for future `generate_image` invocation
- Target production asset payload below ~12 MB for initial mobile download

### Integration Checklist:
- [ ] Run all 10 generate_image prompts (A01-A10)
- [ ] Save outputs to `public/assets/generated/`
- [ ] Verify file existence, resolution, alpha channels, formats
- [ ] Convert large images to optimized WebP/PNG
- [ ] Preserve PNG/WebP transparency for UI and VFX
- [ ] Crop actual content from atlases; ensure sprite frames evenly aligned
- [ ] Do not assume generated images obey perfect sprite-grid geometry
- [ ] A02/A03 albedo artwork only (not normal/height/PBR maps unless technically valid)
- [ ] Update `public/assets/manifest.json` with all asset entries
- [ ] Wire generated textures/sprites into the running game
- [ ] Provide Canvas/SVG fallbacks noted if tool unavailable
- [ ] Test in-browser: all assets display correctly, no broken references
- [ ] Run `vp check` - all source files correctly formatted
- [ ] Test gameplay with all assets integrated