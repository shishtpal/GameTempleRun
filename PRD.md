# Product Requirements Document (PRD)

# Sky Relic Runner — 3D Endless Runner

**Version:** 1.0  
**Status:** Ready for implementation  
**Target:** Browser (desktop and mobile)  
**Stack:** Three.js, Vite+, TypeScript, HTML/CSS  
**Architecture:** Offline-capable, client-side single-page game with no backend or runtime CDN  
**Inspiration:** The accessible action-and-reaction gameplay loop of the 3D endless-runner genre (e.g., Temple Run), using **wholly original** naming, environment, characters, story, UI and assets.

---

## 1. Implementation directive for the AI coding agent

You are the lead game engineer, technical artist, and gameplay designer. **Implement a complete, visually polished, playable game**, not just a prototype, concept page, starter template, or written plan. Work in small, testable increments. Create actual files in the repository. If the user's repository is pre-existing, examine and preserve its conventions before modifying it.

**Mandatory asset-generation rule:** When a `generate_image` tool is available to the agent, **use it** to create original game artwork before considering generic placeholders: surface textures, pickup and power-up icons, HUD artwork, VFX sprites, title/menu artwork, and concept references. The tool's exact invocation schema is environment-dependent: discover it, follow the exposed interface, and do not fabricate tool calls, URLs, or image files. Image-generation output must be saved and processed into local game assets. If `generate_image` is unavailable or does not export usable files, document that limitation and create attractive local fallback textures via Canvas/SVG and true 3D geometry; never leave broken image references or block the playable game.

**Important distinction:** A generated 2D image does not become an animated 3D model merely by renaming it `.glb`. Use Three.js geometries or genuine glTF assets for 3D characters, terrain, obstacles and scenery. Use generated images for textures, sprites, particle sheets, HUD icons, splash screens, and visual design references.

**Definition of delivery:** The finished repository must start, build, and run locally; contain generated or local assets; include tests, `README.md`, `AGENTS.md`, and an asset manifest; and have no mandatory network dependency after installation/build.

## 2. Product vision

**Working title:** Sky Relic Runner  
**Fantasy:** An agile explorer races across suspended ancient sky-bridges, collecting luminous relics while dodging mechanical traps and making sudden turns above the clouds.

**Core player promise:** “One more run” gameplay: immediate controls, legible threats, rewarding pickups, increasingly intense speed, and a clear reason to improve a personal best.

**Design pillars:**

1. **Instantly responsive:** A swipe or keypress causes a predictable action; inputs are never lost due to frame rate.
2. **Fair but exciting:** Every generated obstacle configuration has a reachable solution, with sufficient reaction time.
3. **Readable at speed:** Distinct obstacle silhouettes, color cues, and consistent camera positioning.
4. **Visually complete:** A cohesive 3D world, polished HUD, particles, animation, audio, and generated artwork.
5. **Efficient and maintainable:** Modular TypeScript, object pooling, deterministic generation, adjustable quality.

**Target audience:** Casual players aged 10+ who play short sessions of approximately 1–5 minutes. The game is playable with keyboard or touch; no account, ads, leaderboard server, payments, or backend.

## 3. Goals, non-goals, and success criteria

### 3.1 Goals for version 1.0

- Players can start, pause, resume, lose, and restart without refreshing.
- Player auto-runs on a 3-lane route in real 3D.
- Players can move left/right, jump, slide, and make signaled 90° turns.
- Endless procedural segments include environment variation, obstacles, collectible trails, and occasional safe turn intersections.
- The game displays distance, run score, collected relics, multiplier, and local high score.
- Power-ups: shield, magnet, and score multiplier.
- Distinct main menu, pause overlay, help/control overlay, settings, and game-over screen.
- Keyboard and swipe controls work on desktop and mobile; screen layout adapts to size and safe areas.
- Game starts from a static build without runtime requests to third-party services.
- Asset workflow uses `generate_image` when available, with locally saved outputs.

### 3.2 Non-goals for version 1.0

- Multiplayer, accounts, cloud synchronization, network leaderboards, social logins.
- Proprietary game engines, heavy physics engines, server-authoritative gameplay.
- A Temple Run replica, including copied artwork, title, maps, branding, music, characters, or distinctive protected elements.
- A complex skeletal animation pipeline requiring professional DCC software; procedural character animation is acceptable.
- Native Android/iOS packaging or online monetization.

### 3.3 Measurable outcomes

| Metric              | Target / test condition                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| Game loop           | Full start → run → lose → restart works repeatedly without reload                                       |
| Performance         | Aim for 60 FPS on mainstream desktop, 30+ FPS on a mid-range phone; test and report actual hardware     |
| Difficulty fairness | No known generated sequence is impossible with legal inputs                                             |
| Input               | Distinct actions are recognized once per swipe/key press; controls remain usable during speed increases |
| Reliability         | No uncaught errors in routine gameplay; pause/resume and resize are stable                              |
| Build quality       | `vp check`, `vp test`, and `vp build` pass                                                              |
| Offline behavior    | Bundled assets are local; an already loaded game continues without network access                       |
| Asset integrity     | Every referenced local asset exists and has a documented license/origin/prompt                          |

## 4. Game design

### 4.1 Main gameplay loop

1. Open game → polished title/menu with **Play**, **How to Play**, **Settings**.
2. Play → load/prewarm required scene assets → show short, skippable “3, 2, 1, RUN” countdown.
3. Explorer runs forward automatically; distance and score grow.
4. Switch lanes, jump barriers and gaps, slide under beams, collect relics, activate power-ups, and perform turns.
5. Speed and obstacle density rise gradually; near-miss visuals and collecting streaks reinforce momentum.
6. Collision with an unprotected lethal obstacle, falling into a gap, or missing a required turn ends the run.
7. Game-over overlay summarizes distance, score, collected relics, and personal best; **Retry** starts immediately.

### 4.2 World coordinate and movement model

- **Three lanes** with logical IDs `-1`, `0`, `+1` (left, center, right); default lane `0`.
- **Lane width:** approximately `2.3 world units` (configurable).
- **Forward progress:** Store scalar `runDistance` (meters-equivalent world units), independent of world heading.
- **Route basis:** Each straight piece has `origin`, `heading`, `forward`, and `right` axes. Convert (`distance along segment`, `lane offset`, `vertical height`) into world position.
- **Track travel:** Character appears to run forward in world space; keep visible track pieces and scenery around the player using pooled chunks. Apply a floating-origin offset if large coordinates become unstable.
- **Running speed:** Start near `10 units/sec`; increase smoothly toward `22 units/sec` over several minutes; tune from playtest feedback.
- **Lane transitions:** Interpolate toward a target lane over approximately `0.16–0.22 sec`, using easing; logical lane input is queued or locked as necessary to avoid a single action jumping two lanes.
- **Actions:** Keyboard arrows/A-D switch lanes; up/W/space jumps; down/S slides. While a turn cue is active, left/right is interpreted as the corresponding turn command rather than a normal lane switch.

### 4.3 Jumping and sliding

- **Jump:** ~`0.90 sec` airborne; tune apex to clear designated low hazards. Use a deterministic vertical velocity/gravity calculation, not frame-dependent tweens.
- **Slide:** ~`0.75 sec` effective crouch duration, with visibly reduced collision height and smooth animation blend.
- Mutually exclusive jump and slide action states unless explicitly implemented and tested.
- Allow a narrow, clearly specified buffered input window near landing so controls feel responsive.
- No unintended double jump; jumping from a gap does not reset vertical velocity.
- Collisions depend on the player's actual simulated posture/height, not on animations alone.

### 4.4 90° turns

- Spawn occasional left/right **junctions** with a clear upcoming arrow cue (world-space sign plus HUD arrow) approximately `20–30 units` before the corner.
- Turn zones must be hazard-free immediately before, during, and after the corner.
- When the player enters a well-defined turn-input window near the corner, the matching left/right key or swipe performs the turn. A wrong input or missed turn causes a visible off-path fall/game-over.
- The track uses a 90° heading change; character, camera, and world-relative movement rotate smoothly around the corner. This must be a **real traversable bend**, not simply a HUD animation.
- Preserve lane continuity through the bend, and keep the turn trigger independent of frame rate.
- Prevent visibly intersecting active track sections when generating turns; reject and reroll an incompatible turn or substitute a straight segment.
- Because left/right also selects lanes, the active turn window must be shown unmistakably; outside it, controls retain normal behavior.

### 4.5 Hazards and readable counter-actions

| Hazard                       | Visual silhouette                                          | Valid counter-action                            |
| ---------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| Crate / stone block          | Full-height, single-lane obstacle                          | Change lane                                     |
| Low barrier                  | Waist-height beam/rock                                     | Jump or change lane                             |
| Overhead gate                | Raised crossbar and side posts                             | Slide or change lane                            |
| Broken bridge gap            | Missing floor in one lane or clearly marked full-width gap | Jump if designed jumpable; otherwise avoid lane |
| Rotating trap (later unlock) | Slow, easily telegraphed animated blade/arm                | Timed jump/slide or lane change                 |

- Spawn telegraph particles/signs for particularly dangerous variants.
- Avoid unfairly overlapping an overhead gate and a low barrier in the same lane unless a safe alternative lane is reachable.
- Collision should be based on simple logical bounding volumes; do not use per-triangle mesh collisions.
- Hits consume shield if active; otherwise enter a single terminal death transition.

### 4.6 Collectibles and power-ups

- **Relic shards:** Float slightly above path; animate bobbing/rotation; collected within a small radius using inexpensive distance checks.
- **Score:** `floor(distance × baseDistanceRate) + relicPoints × activeMultiplier`, calculated from a central game state with integer-safe accumulation. Keep UI display consistent with authoritative state.
- **Shield:** Protects against one eligible obstacle collision; lasts at most `10 sec` if unused. It does not save a missed turn or a fall off the world unless deliberately designed to do so.
- **Magnet:** Collects nearby relics within approximately `4 units` for `8 sec`; animate attraction.
- **Multiplier:** Doubles relic points and distance points for `8 sec`; avoid unbounded stacking.
- Pickup visuals, distinctive silhouettes, HUD timer ring, activation VFX, and sound effect are mandatory.
- Spawn power-ups sparingly and do not spawn multiple pickups in unreachable configurations.

### 4.7 Difficulty and fairness

- First `12–15 seconds`: teaching-friendly obstacles, visible relic trails, no turns until controls can be learned.
- Increase speed gradually; raise the number of obstacle patterns while retaining a fair reaction window.
- At current speed `v`, apply minimum warning distance of `max(12, v × 0.9)` units for new decisions, with extra allowance for landings and successive lane changes.
- Do not spawn impossible triple-lane walls. A fully blocked cross-section is legal only if a provably reachable jump or slide action is available; prefer simpler patterns in v1.
- Build a **reachable-state validator**, not just a per-row empty-lane check. Consider lane switch time, jumping/sliding time, action lockouts, lane-target availability, and turn inputs over a short forward horizon.
- Use deterministic seeded pseudorandom generation (e.g., Mulberry32 or xorshift32) to reproduce failures with a shared `seed` value.
- Expose difficulty values in one config file and make patterns data-driven.

### 4.8 Score, progression and replay

- Display current score, distance, relic count, and best score.
- Save best score, best distance, settings, and cumulative collected relics to versioned `localStorage`; validate loaded values and handle storage unavailable/quota errors without crashing.
- End-of-run results show records and replay seed (for debugging).
- Add optional lightweight achievements (first 1000 meters, 100 relics in one run) only after core gameplay is stable.

## 5. Controls and UX

| Action           | Desktop             | Touch                                    |
| ---------------- | ------------------- | ---------------------------------------- |
| Move left        | Left / A            | Swipe left                               |
| Move right       | Right / D           | Swipe right                              |
| Jump             | Up / W / Space      | Swipe up                                 |
| Slide            | Down / S            | Swipe down                               |
| Turn at junction | Matching left/right | Matching left/right swipe in turn window |
| Pause/resume     | Escape / P          | Pause button                             |
| Start/restart    | Click / Enter       | Tap                                      |

**Input details:**

- Detect swipe from `pointerdown`/`pointerup`; require a minimum travel threshold of approximately `35 CSS px` or a DPI-appropriate equivalent, and choose the dominant axis.
- Prevent a single pointer gesture from triggering multiple actions. Ignore gameplay input when the player is dead or UI overlay has focus.
- Use `touch-action: none` on the game interaction canvas/surface while not hijacking scrolling outside the game.
- Key presses should be edge-triggered with configurable cooldowns; ignore repeat events for discrete movements.
- On pause or `visibilitychange`/blur, suspend simulation time and timers; resume without a large physics delta.
- Support desktop landscape, mobile portrait and mobile landscape. Honor screen safe-area insets and avoid overlapping controls with the HUD.
- Provide mute and reduced-effects toggles. Respect `prefers-reduced-motion` by default for camera shake/flash intensity.
- Buttons must have accessible text/labels; UI should be keyboard-navigable outside gameplay.

### 5.1 Screens

1. **Boot/loading:** Brand artwork, loading progress, WebGL support error fallback.
2. **Main menu:** Title, atmospheric animated 3D background, Play, How to Play, Settings, Best Score.
3. **Gameplay HUD:** Score, distance, relics, power-up indicators/timers, pause button, junction warning.
4. **Pause/settings:** Resume, restart, sound settings, quality mode, controls/help.
5. **Game over:** Cause of failure, score, distance, relics, new personal best indication, retry, main menu.

## 6. Visual direction and audio

### 6.1 Original aesthetic

- Stylized **sky ruins** with floating stone roads, brass machinery, luminous turquoise relics, warm sunset lighting, low-poly trees, hanging banners, clouds and distant floating islands.
- Clear depth cues: mist/fog, background gradients, shadows under feet, emissive relics, geometric silhouettes.
- Avoid photographic realism and excessive clutter; important hazards must stand out from scenery.
- Distinct character: original explorer with scarf, boots, satchel, and simple exaggerated movements. Do not imitate recognizable Temple Run characters.
- Camera: elevated over-the-shoulder follow, approximate field of view `60–75°`, smoothed tracking with gentle anticipation and subtle shake on collisions. Turn smoothly with the path.
- Start with one core biome and 2–3 purely visual variations (e.g., warmer/cooler sky, different prop layouts). Additional biomes are optional, not a blocker.

### 6.2 Animation and VFX

- Character must visibly run, lean when switching lanes, jump, crouch/slide, stumble/die and turn.
- Implement character as actual 3D geometry with parented limb groups and procedural animation or genuine glTF clips. `THREE.AnimationMixer` is suitable for glTF clips; manual motion via time-based transforms is acceptable for procedural rigs.
- Coins: spin/bob, shrinking/glowing collection pop.
- Jump: dust puff on takeoff and landing; slide: short streak; magnet: lines/particles; shield: protective bubble; collision: flash and impact burst.
- Use generated transparent PNG/WebP sprites for decorative 3D billboards or textured quads; use custom meshes for interactive hitboxes.

### 6.3 Audio

- One subtle looping original/royalty-free music track or a locally synthesized ambient loop; do not fetch copyrighted music at runtime.
- SFX: run/footfalls, jump, slide, lane move, pickup, power-up, turn success, collision, game over, click.
- Audio unlock occurs only after a user gesture; Web Audio must fail gracefully when unavailable.
- Use pooled/reused audio sources where appropriate. Include mute, separate music/SFX levels if straightforward.

## 7. Mandatory `generate_image` asset pipeline

**The following is a deliverable, not merely an artistic suggestion.** The coding agent must attempt real tool-driven image generation for original game assets if a `generate_image` tool is exposed. Prioritize assets that will appear in the game rather than generating unrelated concept art.

### 7.1 Required asset batches

| ID  | Asset                                                             | Format / processing                                         | Intended use                       | Priority |
| --- | ----------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------- | -------- |
| A01 | Polished main-menu illustration, wide sky ruins, no baked-in text | Original image → optimized WebP                             | Title/menu background              | P0       |
| A02 | Ancient carved stone and masonry seamless surface                 | Generate square texture; check seams, crop/tile as needed   | Bridge/ruins material              | P0       |
| A03 | Brass/metal embossed surface                                      | Square texture or detail mask                               | Trap and machinery material        | P0       |
| A04 | Sky/cloud backdrop or distant floating islands                    | Wide image; optional stylized environment planes            | Atmospheric background             | P0       |
| A05 | Shard collectible icon                                            | Transparent background; trim and center                     | HUD and pickup billboard reference | P0       |
| A06 | Shield, magnet, multiplier icon set                               | Transparent images; normalize sizes and alpha               | Power-up HUD                       | P0       |
| A07 | Glow burst, dust puff, sparkle, directional speed streak          | 4–8 separate RGBA sprites or validated atlas                | Particle/VFX textures              | P0       |
| A08 | Explorer 3/4-view concept reference                               | Concept only; convert into procedural original 3D character | Style/shape reference              | P1       |
| A09 | Branded title emblem without title letters                        | Transparent image; overlay real text in DOM                 | Menu polish                        | P1       |
| A10 | Warning arrows / decorative runes                                 | Transparent sprites or CSS/SVG if clearer                   | Turn indicators and scenery        | P1       |

### 7.2 Image-generation prompt requirements

Use style continuity across all assets:

**Global art direction prefix:**

> Original stylized 3D adventure game art, floating sky ruins, warm golden-hour lighting, weathered sandstone, oxidized brass, luminous turquoise crystals, crisp silhouettes, readable colors, cohesive painterly low-poly aesthetic, no copyrighted characters, no logo, no watermark, no letters.

**Example prompts to invoke through `generate_image`:**

**Menu background (A01):**

> Wide cinematic view of an original floating stone sky-bridge stretching toward ancient aerial ruins above sunlit clouds, brass gears, glowing turquoise relics, atmospheric depth, strong clear center composition with negative space reserved for title and buttons, stylized premium 3D adventure game environment, no characters, no text, no watermark, 16:9.

**Stone texture (A02):**

> Square orthographic seamless-looking stylized game texture of worn honey-colored carved sandstone blocks with subtle cracks and mortar, diffuse/albedo appearance, uniform flat lighting, no cast shadows, no objects, no perspective, no text, 1:1. After generation, correct edges and verify tiling programmatically.

**Collectible icon (A05):**

> Single luminous turquoise diamond-like relic shard for a stylized mobile adventure game HUD, centered, full silhouette in frame, clean readable shape, transparent background, no shadow outside subject, no text or watermark, 1:1.

**Power-up icons (A06):**

> Single polished shield power-up icon made of weathered brass with a turquoise glowing core, stylized casual game UI, centered object, crisp silhouette, transparent background, no words, no watermark, 1:1. Repeat separately for magnet and 2x multiplier; render numerical 2x label in HTML/CSS if needed rather than relying on AI text accuracy.

**VFX sprite (A07):**

> Single soft circular magical turquoise sparkle burst for a game particle texture, centered, bright core, smooth alpha fade at edges, isolated on fully transparent background, no words, 1:1. Repeat for dust puff and motion streak.

**Character concept (A08):**

> Original cheerful explorer in a short scarf, goggles, sturdy boots, small satchel, turquoise accents, stylized low-poly-friendly proportions, full-body three-quarter view, neutral clear background, simple construction suitable for recreation with Three.js primitive geometry, no resemblance to any existing game hero, no words.

### 7.3 Processing and integration instructions

1. Generate images using `generate_image` and capture the output path or supported downloadable asset reference from the tool response.
2. Save files under `public/assets/generated/` using descriptive filenames: `menu-sky-ruins.webp`, `stone-albedo.webp`, `relic-shard.webp`, `fx-sparkle.webp`, etc. Never reference temporary tool URLs in shipped code.
3. Validate actual file existence, resolution, alpha channels, and formats. If transparency is absent, regenerate with transparency or use a verified background-removal procedure rather than displaying white/black rectangles.
4. Convert large images to optimized WebP or PNG as appropriate. Preserve PNG/WebP transparency for UI and VFX. For generated atlases, crop actual content and ensure sprite frames are evenly aligned; **do not assume** the generated image obeys perfect sprite-grid geometry.
5. Generated stone/metal images are **albedo artwork**, not automatically normal, height, roughness or PBR maps. Generate those only if technically valid; use sensible procedural material roughness settings otherwise.
6. Apply textures via `THREE.TextureLoader` or async asset loading. Set correct `colorSpace` for color maps; use appropriate wrapping, filtering and anisotropy. Dispose textures/materials on teardown where applicable.
7. Add a `public/assets/manifest.json` (or a typed importable manifest) listing each filename, type, intended use, generation prompt, origin (`generate_image` / procedural), date or version, dimensions, transparency, and license/usage notes.
8. Wire generated textures and sprites into the actual running game. Unused generated artwork does not satisfy the requirement.
9. Provide fallback Canvas/SVG/procedural textures when the image-generation tool is unavailable; game launch cannot depend on an image-generation API call.
10. Maintain a **consistent art style**, readable contrasting palette, and local assets only. Do not download unknown copyrighted game assets or use watermarked outputs.

### 7.4 Asset budgets and fallback policy

- Use 512–1024 px square source textures unless a larger image clearly improves quality; reduce and compress where feasible.
- The target production asset payload should ideally stay below ~12 MB for an initial mobile download; document if not met.
- Basic geometry and simplified material colors must keep the game fully playable when an optional texture fails.
- Show a loading progress bar while required local textures/audio are fetched.

## 8. Technical specification

### 8.1 Mandatory stack

| Concern             | Choice                                                                                |
| ------------------- | ------------------------------------------------------------------------------------- |
| Language            | TypeScript, strict configuration                                                      |
| Build/dev/test/lint | **Vite+** (`vite-plus`, `vp` CLI)                                                     |
| 3D graphics         | `three` (Three.js)                                                                    |
| UI                  | Native HTML/CSS/TypeScript overlays; do not add React/Vue without a demonstrated need |
| State               | Typed finite-state game state and small event bus / typed observable store            |
| Persistence         | `localStorage` with versioned schema and defensive parsing                            |
| Audio               | Web Audio API or Three.js audio wrappers with graceful fallback                       |
| Automated tests     | Built-in Vite+ Vitest (`vite-plus/test`) for simulation, generation and state         |
| Runtime             | Static browser hosting; no server/backend, no runtime CDN                             |

**Vite+ verification:** The official Vite+ tooling supports `vp create`, `vp dev`, `vp check`, `vp test`, `vp build`, and `vp preview`. Vite+'s `test` import is `vite-plus/test`. Refer to the official documentation rather than assuming legacy Vite CLI setup details.

**Scaffolding options:**

```bash
# With the global vp CLI:
vp create vite:application --directory sky-relic-runner
cd sky-relic-runner
vp add three
vp add -D @types/three
vp dev

# Or, without installing vp globally:
npm create vite-plus@latest -- vite:application --directory sky-relic-runner
cd sky-relic-runner
npm install three
npm install -D @types/three
npm run dev
```

**Agent adjustment:** Inspect the generated application template and ensure the project uses the vanilla TypeScript browser entrypoint. If the default template varies, use a Vite+ supported vanilla TypeScript template, or adapt scaffolded files while retaining `vite-plus` and Vite+ commands. Do not install a duplicate separate Vite/Vitest/Oxlint toolchain unless the project genuinely requires it.

**Required build commands:**

```bash
vp dev
vp check
vp test
vp build
vp preview
```

In a local-only Vite+ installation, run these through the project's package manager (`npm exec vp ...` / `pnpm exec vp ...`) or package scripts. `vp check` must include strict type checks by enabling `lint.options.typeAware` and `lint.options.typeCheck` in `vite.config.ts`. Ensure TypeScript and lint configurations are valid for the selected Vite+ version.

### 8.2 Code architecture

- Use a clean separation between **deterministic simulation** and **Three.js rendering**.
- Avoid importing DOM, audio, or Three.js into mathematical generator/collision/score modules.
- Use a lightweight explicit state machine: `BOOT`, `LOADING`, `MENU`, `COUNTDOWN`, `RUNNING`, `PAUSED`, `DYING`, `GAME_OVER`.
- One `Game` coordinator owns the loop and lifecycle; rendering does not decide collisions or scoring.
- Lifecycle components expose `init`, `update`, `reset`, and `dispose` as applicable.
- Entity ownership is explicit. Avoid event leaks, duplicate requestAnimationFrame loops, and orphaned meshes after restart.
- Expose a single typed configuration for speeds, timings, dimensions, collision bounds, obstacle patterns, camera offsets, and quality levels.

### 8.3 Suggested repository structure

```text
sky-relic-runner/
├── AGENTS.md
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── public/
│   └── assets/
│       ├── generated/               # Actual generate_image outputs
│       ├── audio/                   # Locally shipped audio
│       └── manifest.json            # Asset provenance/prompt registry
├── scripts/
│   └── assets/                     # Optional normalization/compression scripts
├── src/
│   ├── main.ts
│   ├── styles/
│   │   ├── global.css
│   │   └── hud.css
│   ├── app/
│   │   ├── Game.ts
│   │   ├── GameState.ts
│   │   ├── GameConfig.ts
│   │   ├── GameEvents.ts
│   │   └── GameLoop.ts
│   ├── core/
│   │   ├── Random.ts
│   │   ├── Pool.ts
│   │   ├── MathUtils.ts
│   │   └── Storage.ts
│   ├── gameplay/
│   │   ├── PlayerController.ts
│   │   ├── InputController.ts
│   │   ├── RunSimulation.ts
│   │   ├── CollisionSystem.ts
│   │   ├── ScoreSystem.ts
│   │   ├── DifficultySystem.ts
│   │   └── PowerUpSystem.ts
│   ├── world/
│   │   ├── TrackPath.ts
│   │   ├── TrackGenerator.ts
│   │   ├── TrackSegment.ts
│   │   ├── PatternValidator.ts
│   │   ├── ObstacleFactory.ts
│   │   ├── PickupFactory.ts
│   │   └── SceneryFactory.ts
│   ├── render/
│   │   ├── SceneRenderer.ts
│   │   ├── CharacterMesh.ts
│   │   ├── CharacterAnimator.ts
│   │   ├── FollowCamera.ts
│   │   ├── ParticleSystem.ts
│   │   ├── Lighting.ts
│   │   └── QualityManager.ts
│   ├── assets/
│   │   ├── AssetLoader.ts
│   │   └── AssetCatalog.ts
│   ├── audio/
│   │   └── AudioManager.ts
│   ├── ui/
│   │   ├── Screens.ts
│   │   ├── HUD.ts
│   │   └── Settings.ts
│   └── tests/
│       ├── movement.test.ts
│       ├── generator.test.ts
│       ├── fairness.test.ts
│       ├── scoring.test.ts
│       ├── collision.test.ts
│       └── persistence.test.ts
└── docs/
    ├── GAMEPLAY.md
    └── ASSETS.md
```

### 8.4 Suggested typed interfaces

```ts
type Lane = -1 | 0 | 1;
type Action = "LEFT" | "RIGHT" | "JUMP" | "SLIDE" | "PAUSE";
type Phase =
  | "BOOT"
  | "LOADING"
  | "MENU"
  | "COUNTDOWN"
  | "RUNNING"
  | "PAUSED"
  | "DYING"
  | "GAME_OVER";

type ObstacleType = "BLOCK" | "LOW_BARRIER" | "OVERHEAD_GATE" | "GAP";
type PowerUpType = "SHIELD" | "MAGNET" | "MULTIPLIER";
type Heading = 0 | 1 | 2 | 3; // quarter-turns around world up axis

interface PlayerState {
  lane: Lane;
  lateralOffset: number;
  forwardDistance: number;
  y: number;
  verticalVelocity: number;
  posture: "RUNNING" | "JUMPING" | "SLIDING" | "DYING";
  slideRemaining: number;
  protectedByShield: boolean;
}

interface TrackPiece {
  id: string;
  startDistance: number;
  length: number;
  heading: Heading;
  kind: "STRAIGHT" | "TURN_LEFT" | "TURN_RIGHT";
  obstacles: ObstacleSpawn[];
  pickups: PickupSpawn[];
}

interface RunState {
  phase: Phase;
  seed: number;
  elapsedSeconds: number;
  distance: number;
  speed: number;
  score: number;
  relics: number;
  multiplier: number;
}
```

These are guidelines; refine when implementing the real simulation while retaining strong types and explicit invariants.

### 8.5 Frame loop and determinism

- Use `requestAnimationFrame` for visual frames and **fixed timestep `1/60 sec`** for game simulation.
- Clamp abnormal elapsed wall time to `100 ms` and limit steps per frame (e.g., max 5) to avoid a spiral of death; do not silently fast-forward through collisions after returning from background.
- When paused, freeze elapsed gameplay time, status durations, movement and particles; audio should pause/suspend as appropriate.
- Prefer interpolation for visual transforms between simulation states where needed.
- Generate segments based on `seed + generation state`, not `Math.random()` scattered across modules.
- Keep collision and scoring results independent of device FPS.

### 8.6 Track generation and pooling

- Generate 3D roadway segments ahead of the runner (`~100–160 units` ahead) and retire pieces safely once behind camera (`~30–50 units` behind).
- Use variable-size straight segments of `18–28 units`; occasional turns are separate geometry pieces.
- Use pools for track pieces, obstacle meshes, relic meshes, particle emitters, and scenery objects.
- Prioritize _correct, seamless topology_ at joins. Avoid gaps in visible mesh and inverted lateral axes after turns.
- Spawn hazards and pickups using data-driven patterns; validate against `PatternValidator` before accepting.
- Maintain a short list of active chunks only; dispose/recycle old objects.
- Use `THREE.InstancedMesh` for highly repeated geometry such as relics or decorative stones when lifecycle/reuse allows; do not instanced-render objects that require unique complex animation unless appropriately implemented.
- Prefer simple local ambient and directional lights, fog, baked-looking vertex colors/roughness, and selective shadows rather than high-cost dynamic lights per prop.

### 8.7 Collision system

- Character has simplified posture-dependent capsule/box approximation for each frame.
- Obstacle descriptors contain route `segmentId`, local longitudinal position, lane, action requirements, bounding dimensions and unique ID.
- Use a broad-phase lookup over nearby active obstacles and an exact-enough local-space AABB or swept interval collision test to avoid tunneling at high speed.
- Pickups use radial proximity plus lane/height checks; never double count collected items.
- Record collision cause for meaningful game-over UI.
- When shield absorbs collision, mark obstacle resolved or give temporary invulnerability to avoid repeated damage within the same overlap.

### 8.8 Camera, resizing and quality

- Use `THREE.PerspectiveCamera` following a desired target transform behind and above the player, smoothed with a time-correct approach (`1 - exp(-k*dt)`).
- Resize renderer to canvas client dimensions; update camera aspect and projection matrix.
- Cap device pixel ratio: suggested low quality `1.0`, medium `1.5`, high `2.0` (do not blindly render at very high mobile DPR).
- Provide `Auto`, `Low`, `Medium`, `High` settings. Adjust shadow resolution, texture resolution where available, particles, effects and DPR.
- Context lost/restored: show an error/pause state; attempt graceful recovery, or provide restart guidance.
- Avoid expensive per-frame allocations, repeated mesh/material construction, unbounded arrays, and shadow-casting on every decorative mesh.
- Use Chromium/Firefox/Safari testing where possible. Require WebGL 2; show a clear unsupported-device message if unavailable.

## 9. User journeys and acceptance criteria

### Journey A: First launch

**Given** a supported browser, **when** the player opens the game, **then** loading completes, menu artwork appears, and Play starts a countdown and a visible animated character in a correctly rendered 3D environment.

### Journey B: Basic controls

**Given** a running game, **when** the user switches lanes, jumps, or slides, **then** visual movement and gameplay collision bounds match the input, with no doubled action from one swipe.

### Journey C: True turn

**Given** an upcoming right turn, **when** the matching right action is pressed within the input window, **then** the character takes an actual right-angle path, the camera turns, and gameplay continues without teleportation/discontinuity. A missed turn ends the run.

### Journey D: Fair procedural run

**Given** many tested generation seeds and increasing speeds, **when** obstacle patterns spawn, **then** a plausible valid path exists through the active obstacle horizon (including posture timing and lane-switch constraints), and geometry contains no visible seams or unreachable active pickups.

### Journey E: Power-ups

**Given** an available power-up, **when** picked up, **then** the appropriate icon, countdown, visual effect, collision/collection/score behavior, and expiration are consistent.

### Journey F: Game over and persistence

**Given** a collision without protection, **when** the game ends, **then** gameplay stops once, results are accurate, personal best is saved, and Retry starts a clean new run without leaked objects or stale controls.

### Journey G: Device compatibility

**Given** a touch device in portrait or landscape, **when** the player swipes, resizes, rotates, backgrounds/resumes, or pauses, **then** input, HUD placement, camera aspect and simulation remain valid.

### Journey H: Asset requirement

**Given** access to `generate_image`, **when** implementation runs, **then** generated source images are actually saved to `public/assets/generated`, optimized, listed in the manifest, and displayed in-game. If the tool is unavailable, an explicit fallback note and real local procedural assets are present.

## 10. Testing and quality gates

### 10.1 Automated unit tests (Vite+)

Test **pure functions** under `vp test`:

- Deterministic RNG yields the same segment sequence for the same seed.
- Lane boundaries enforce `-1 ≤ lane ≤ 1` and ignore illegal commands.
- Player jump arc returns to ground without dependence on render FPS.
- Slide collider height changes for the correct duration.
- Collision results vary correctly by lane, posture, obstacle type, and shield status.
- Score, multiplier, magnet, shield, and persistence version migration are correct.
- Generator never emits obviously unsolvable simple patterns.
- Reachability validator rejects curated impossible obstacle/action sequences.
- Turn-window semantics handle early, late, matching, and wrong input.
- Seeded regression tests for every fixed generation bug.

### 10.2 Manual browser smoke test matrix

| Scenario                                      | Desktop keyboard | Mobile touch |
| --------------------------------------------- | ---------------- | ------------ |
| Launch and play                               | Required         | Required     |
| Lane switch × 20 / jump / slide               | Required         | Required     |
| 5 successive correct turns                    | Required         | Required     |
| Missed turn and retry                         | Required         | Required     |
| Collect shield, magnet, multiplier            | Required         | Required     |
| Run 5 minutes, monitor FPS/memory             | Required         | Required     |
| Pause, tab away, resume                       | Required         | Required     |
| Resize/rotate and toggle quality              | Required         | Required     |
| Build output with network disabled after load | Required         | Required     |

Test interaction timing at low FPS by throttling the browser and on at least one real or representative mobile device when possible. Do not claim tested hardware FPS without actual measurement.

### 10.3 Quality gates

Before marking complete:

```bash
vp check
vp test
vp build
vp preview
```

`vp preview` is a smoke-test server and remains running until stopped; verify its output using a browser. Fix all regressions, broken paths, missing images, TypeScript errors and obvious gameplay failures.

## 11. Implementation phases and exit gates

### Phase 0 — Project setup (P0)

- Scaffold strict TypeScript Vite+ app, install Three.js and typings.
- Set up HTML overlay root, canvas, stylesheet, configuration, asset loader, local manifest, lint/typecheck/test scripts.
- Build initial 3D scene with camera/light and one visible roadway.
- **Exit:** `vp dev`, `vp check`, `vp test`, `vp build` pass; browser shows basic 3D scene.

### Phase 1 — Playable core (P0)

- Game loop, state machine, playable character mesh and running animation.
- Three-lane controls, jump/slide, collision detection, death/retry.
- Pooled straight segments, simple safe obstacle patterns, score and distance.
- Desktop/touch input.
- **Exit:** A complete, endlessly replayable straight-path run works without refresh.

### Phase 2 — Complete traversal and fairness (P0)

- True 90° turns and matching control windows.
- Procedural turn-aware track, turn signals, valid topology, bounded segment cleanup.
- Deterministic generation and reachable-state pattern validator; seeded tests.
- **Exit:** Player can run for multiple minutes through turns and obstacles; impossible patterns rejected.

### Phase 3 — Relics and progression (P0)

- Relic trails, score modifiers, shield/magnet/multiplier and HUD timers.
- Better difficulty curve, persistence, results screen and menu screens.
- **Exit:** Full score/collect/progress/retry experience with accurate saved best.

### Phase 4 — AI assets, game feel and polish (P0)

- Run `generate_image` for P0 asset batches if available; optimize/integrate files and update asset manifest.
- Improve character/scenery, lighting, VFX, SFX, menu/loading art, accessibility and UI transitions.
- **Exit:** Cohesive original visual identity and audio; no missing assets or temporary art.

**Note:** Asset generation should begin earlier (Phase 0 or Phase 1) when tool access is available. Phase 4 is the final integration and quality gate, not a reason to postpone all artwork until the end.

### Phase 5 — Optimization and delivery (P0)

- Profile, pool, add graphics quality settings, mobile layout, resize/recovery fixes.
- Verify tests, static production build, README and AGENTS guidance.
- **Exit:** Production build works locally, documented constraints are honest, and all P0 acceptance criteria pass.

### Optional phase 6 — Stretch features (P1/P2, only after completion)

- Additional fully distinct biomes, weather/time changes, character cosmetics, achievements, gamepad support, daily seeded challenge, screenshot/share card, optional installable PWA with explicitly configured service worker caching.
- Never sacrifice tested core gameplay to start optional features.

## 12. Required documentation

### `README.md`

Must include:

- Project overview and screenshot/preview references to actual local artifacts.
- Prerequisites and correct Node/Vite+ setup.
- Install, dev, test, check, build, preview commands, including Windows PowerShell examples.
- Desktop and touch controls.
- Asset structure and how to regenerate/replace textures.
- Deployment to static hosting (ensure base paths for relative assets are correct).
- Performance/quality settings and known limitations.

### `AGENTS.md`

Must tell future coding agents:

1. Preserve `three` + `vite-plus` + strict TypeScript; no major framework/backend without explicit request.
2. Keep logic modules testable and renderer-independent.
3. Run `vp check`, `vp test`, `vp build` after changes.
4. Update generated asset manifest whenever an asset changes.
5. Use `generate_image` for new textures, UI art and VFX where available; save and integrate outputs, or use real fallback assets.
6. Never introduce copyrighted Temple Run artwork, music, names or characters.
7. Maintain seeded replay tests for procedural track bugs.
8. Keep the desktop/touch input mapping and turn semantics synchronized.
9. Do not claim features complete unless verified in-browser.

### `docs/ASSETS.md`

- Generation prompts and asset variants.
- Conversion/compression scripts, actual file dimensions/alpha and color-space conventions.
- Guidance for editable procedural geometries versus 2D generated images.
- License/provenance notes and precise fallbacks.

## 13. Definition of done — release checklist

- [ ] Original 3D explorer is visible and animated.
- [ ] Endless track with seamless segments and real 90° turns works.
- [ ] Keyboard and touch lane, jump, slide and turn inputs work.
- [ ] Obstacles and gaps have functional collisions and understandable counter-actions.
- [ ] Procedural generator produces validated fair patterns and stable runs.
- [ ] Shards, shield, magnet and multiplier work and display clearly.
- [ ] Score, distance, best records, and results are accurate and persistent.
- [ ] Menu, countdown, HUD, pause/settings, and game-over screens are finished.
- [ ] `generate_image` was used for available original assets, or its unavailability and procedural fallbacks are documented.
- [ ] Generated images are local, optimized, attributed in manifest, and used on-screen.
- [ ] 3D world, HUD, VFX, character animation, and audio present a cohesive style.
- [ ] Mobile resize, aspect ratio, touch, safe-area and background behavior work.
- [ ] No major memory growth, repeated game loop, excessive draw calls or missing/disconnected mesh after multiple restarts.
- [ ] `vp check`, `vp test`, and `vp build` pass.
- [ ] README, AGENTS.md, asset manifest and build instructions are complete.
- [ ] Agent performs a final interactive browser smoke test and reports which tests were actually run.

## 14. Instructions to Codex / execution expectations

**Execute this PRD as an implementation contract, not as a request to produce another plan.**

1. Inspect current repo; scaffold only if empty.
2. Choose stable current compatible package versions; verify Vite+ setup using official documentation.
3. Create the full modular source tree and implement P0 phases end-to-end in order.
4. **Discover and use `generate_image`** for original locally saved artwork when available; integrate outputs immediately in menus, textures, icons, and particles. Do not substitute prompt text for actual files.
5. If tooling limitations prevent a particular image deliverable, use procedurally authored geometry/Canvas/SVG fallback and record the limitation rather than stopping.
6. Write and run unit tests, validate builds, and manually exercise gameplay; fix issues found.
7. Provide concise final completion notes including the commands used, delivered features, actual test outcomes, and remaining limitations. Do not misrepresent untested functionality as verified.

**First milestone to implement immediately:** a working browser game with player auto-running along an endless 3-lane track, keyboard/touch lane changes, jumping, sliding, collisions, game-over and restart. All additional features build on this playable milestone.

---

## 15. Reference documentation

- Official Vite+ guides: https://viteplus.dev/guide
- Vite+ project creation: https://viteplus.dev/guide/create
- Vite+ `vp check`: https://viteplus.dev/guide/check
- Vite+ tests: https://viteplus.dev/guide/test
- Three.js docs: https://threejs.org/docs/
- Three.js instanced meshes: https://threejs.org/docs/pages/InstancedMesh.html
- Three.js animation concepts: https://threejs.org/manual/pages/game.html

_All values (speed, distance, collision dimensions, visual asset size) are initial tuning targets, not claims of measured performance. Measure and refine them through playtesting._
