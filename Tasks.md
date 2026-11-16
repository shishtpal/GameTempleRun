# Tasks.md — Implementation Roadmap for Sky Relic Runner

*Derived from PRD v1.0 (Sky Relic Runner — 3D Endless Runner). This file breaks the PRD into concrete, trackable tasks. Check off items as they are implemented and verified.*

---

## 📋 Overview

- **Goal:** Deliver a complete, playable 3D endless runner in the browser using Three.js + Vite+ + strict TypeScript.
- **Target:** Desktop + mobile touch, offline-capable, no backend.
- **Art pipeline:** Use `generate_image` for original assets (see Asset Tasks below). Fall back to procedural/Canvas/SVG when the tool is unavailable.
- **Quality gates:** `vp check`, `vp test`, `vp build`, `vp preview` must all pass before marking complete.
- **Current state:** Repository contains `PRD.md` only. Scaffold the Vite+ app and begin implementation.

---

## 📦 Phase 0 — Project Setup (P0)

| # | Task | Description | Done |
|---|------|-------------|------|
| 0.1 | Scaffold Vite+ app with strict TypeScript | Use `vp create vite:application` or `npm create vite-plus@latest -- vite:application`. Ensure vanilla TS entrypoint, no React/Vue. | |
| 0.2 | Install Three.js and typings | `npm install three`, `npm install -D @types/three`. | |
| 0.3 | Configure `vite.config.ts` | Enable `lint.options.typeAware` and `lint.options.typeCheck`; set up `vp` integration. | |
| 0.4 | Set up `tsconfig.json` | Strict mode, path aliases, Three.js globals. | |
| 0.5 | Create `public/assets/manifest.json` | Empty manifest with schema for later asset entries. | |
| 0.6 | Create `README.md` and `AGENTS.md` | Minimal viable docs (see PRD §12). | |
| 0.7 | Initial build verification | Run `vp dev`, `vp check`, `vp test`, `vp build` — all must pass. | |
| 0.8 | Create basic `index.html` | Canvas container, overlay root, meta viewport, WebGL error fallback. | |

**Exit:** `vp dev` shows a basic 3D scene (clear color, camera, light, one mesh). `vp check` passes with zero TypeScript/lint errors.

---

## 🎮 Phase 1 — Playable Core (P0)

| # | Task | Description | Done |
|---|------|-------------|------|
| 1.1 | Implement finite-state machine | Phases: `BOOT → LOADING → MENU → COUNTDOWN → RUNNING → PAUSED → DYING → GAME_OVER`. | |
| 1.2 | Create `GameState.ts` | Typed state: lane, lateralOffset, forwardDistance, y, verticalVelocity, posture, slideRemaining, protectedByShield. | |
| 1.3 | Add player mesh + running animation | Three.js geometry + `AnimationMixer` or procedural time-based animation. Character visible in 3D. | |
| 1.4 | Implement three-lane system | Logical lanes `-1, 0, +1`; lane width ~2.3 world units; interpolate lateral offset over 0.16–0.22s with easing. | |
| 1.5 | Keyboard controls (desktop) | Arrow keys / A-D for lane change; Up/W/Space for jump; Down/S for slide. Edge-triggered with cooldown. | |
| 1.6 | Touch controls (mobile) | Swipe detection: `pointerdown`/`pointerup`, min travel ~35 CSS px, dominant axis. Same mapping as desktop. | |
| 1.7 | Jump mechanic | Deterministic vertical velocity/gravity; ~0.90s airborne; dust puff on takeoff/landing. | |
| 1.8 | Slide mechanic | ~0.75s crouch duration; reduced collision height; animation blend. | |
| 1.9 | Collision detection | Broad-phase + narrow AABB test per posture; shield absorbs one collision. | |
| 1.10 | Death & retry | Collision without shield → transition to `DYING` → `GAME_OVER`. Retry button starts clean new run. | |
| 1.11 | Endless straight track | Pooled straight segments (18–28 units each); runner auto-runs at 10→22 units/sec. | |
| 1.12 | Distance & score | `floor(distance × baseDistanceRate)` accumulation; display HUD. | |
| 1.13 | Build & test verification | `vp check`, `vp test`, `vp build` pass. `vp preview` shows playable run on endless straight. | |

**Exit:** A complete, endlessly replayable straight-path run works without refresh. Lane changes, jumps, slides, collisions, and restart all function correctly.

---

## 🔄 Phase 2 — Complete Traversal & Fairness (P0)

| # | Task | Description | Done |
|---|------|-------------|------|
| 2.1 | Implement true 90° turns | Spawn left/right junctions with clear arrow cue ~20–30 units before corner. Turn zones hazard-free before/during/after. | |
| 2.2 | Turn input window | Matching left/right key/swipe within window performs turn. Missed turn / wrong input → game over. | |
| 2.3 | Track generator | Data-driven segment generation using seeded RNG (Mulberry32/xorshift32). Segments: straight (18–28 units), turn segments separate. | |
| 2.4 | Segment pooling | Generate ~100–160 units ahead; retire behind camera (~30–50 units). Seamless topology at joins. | |
| 2.5 | Pattern validator | Reachable-state validator: consider lane-switch time, jump/slide time, action lockouts, turn inputs over short forward horizon. Reject impossible patterns. | |
| 2.6 | Deterministic generation | Generator uses `seed + generation state`; never `Math.random()` scattered. Seeded replay for bug reproduction. | |
| 2.7 | Turn signal & HUD warning | World-space sign + HUD arrow indicate upcoming turn. | |
| 2.8 | Build & test verification | `vp check`, `vp test`, `vp build` pass. Gameplay runs through turns for multiple minutes without impossible sequences. | |

**Exit:** Player can run for multiple minutes through turns and obstacles; impossible patterns are rejected; geometry has no visible seams.

---

## 💎 Phase 3 — Relics & Progression (P0)

| # | Task | Description | Done |
|---|------|-------------|------|
| 3.1 | Relic shards | Float slightly above path; animate bobbing/rotation; collection via distance check within small radius. | |
| 3.2 | Score formula | `floor(distance × baseDistanceRate) + relicPoints × activeMultiplier`. Central game state with integer-safe accumulation. | |
| 3.3 | Power-ups: Shield | Protects against one eligible obstacle collision; lasts max 10s if unused. Visual bubble + timer HUD. | |
| 3.4 | Power-ups: Magnet | Collects nearby relics within ~4 units for 8s; animate attraction lines/particles. | |
| 3.5 | Power-ups: Multiplier | Doubles relic + distance points for 8s; prevent unbounded stacking. | |
| 3.5 | Power-up HUD | Icon set (shield, magnet, multiplier); countdown timer ring; activation VFX + sound. | |
| 3.5 | Power-up spawn spawning | Sparse; never multiple pickups in unreachable configs. | |
| 3.8 | Local persistence | `localStorage`: best score, best distance, settings, cumulative relics. Versioned schema; graceful handling of missing/quota errors. | |
| 3.9 | Results screen | Distance, score, relic count, personal best indication, retry, main menu. | |
| 3.10 | Menu screens | Main menu (Play, How to Play, Settings, Best Score), Pause overlay, Settings (sound, quality, controls), Game Over. | |
| 3.11 | Countdown | "3, 2, 1, RUN" skippable before gameplay starts. | |
| 3.11 | Build & test verification | `vp check`, `vp test`, `vp build` pass. Persistence and power-up behaviors verified. | |

**Exit:** Full score/collect/progress/retry experience with accurate saved best score.

---

## 🎨 Phase 4 — AI Assets, Game Feel & Polish (P0)

| # | Task | Description | Done |
|---|------|-------------|------|
| 4.1 | Run `generate_image` for asset batches | Generate all P0 priority assets (A01–A08 per PRD §7.1). **Available in current environment** — generate and save to `public/assets/generated/`. | |
| 4.2 | Optimize & convert | Convert to WebP/PNG; preserve alpha; validate dimensions/channels. | |
| 4.3 | Update asset manifest | List each file: filename, type, use, prompt, origin, dimensions, transparency, license/notes. | |
| 4.4 | Integrate textures into game | `THREE.TextureLoader`; correct `colorSpace`; wrapping/filtering/anisotropy. | |
| 4.5 | VFX & particles | ParticleSystem: jump dust puff (takeoff & landing), slide streak, shield bubble, magnet attraction lines, multiplier glow, collision impact burst, pickup sparkle, collision flash. | |
| 4.6 | Character & scenery polish | Convert A08 concept into procedural 3D character (primitive geometry + AnimationMixer). Add low-poly trees, banners, brass machinery, sky islands. | |
| 4.7 | Lighting & atmosphere | LightingSystem: Hemisphere light (golden hour/sky colors), Directional light (sun), Fog (depth cues matching PRD §6.1, sky blue fog density 20-80 units), directional shadows. | |
| 4.8 | Sound & audio | AudioManager: locally shipped SFX (footsteps, jump, slide, pickup, power-up, turn, collision, game over, UI clicks). Looped ambient track. Web Audio API graceful fallback when unavailable; user gesture required to unlock audio. | |
| 4.9 | Accessibility | `prefers-reduce-motion` respect: reduce camera shake/flash intensity, optional reduced particle count. Mute and separate music/SFX level toggles. HUD respectes reduced-motion setting. | |
| 4.10 | Build & test verification | `vp check` passes (all source files correctly formatted). Gameplay verifiable in-browser. Asset payload documented (~12 MB target per PRD). | |

**Exit:** Cohesive original visual identity and audio; generated images are local, optimized, attributed in manifest, and used on-screen.

**Asset Integrity (PRD §9.3–9.4):** When `generate_image` tool is unavailable, procedural fallbacks via Canvas/SVG implemented per PRD §9:
- Surface textures generated via Canvas with noise patterns and color gradients
- Icon sets generated via SVG with crisp silhouettes and transparent backgrounds
- Color palettes constrained to cohesive palette: honey-colored sandstone, oxidized brass, luminous turquoise, warm golden-hour lighting
- All local assets documented with prompt-style descriptions for future `generate_image` invocation
- Fallback textures are playable and differentiate obstacle types clearly

**Exit:** Cohesive original visual identity and audio; procedural fallbacks documented for future use; no missing assets or broken references.

---

## 📈 Phase 5 — Optimization & Delivery (P0)

| # | Task | Description | Done |
||---


## ➕ Phase 6 — Stretch Features (P1/P2, optional)

| # | Task | Description | Done |
|---|------|-------------|------|
| 6.1 | Additional biomes | Weather/time changes, second/third distinct environments. | |
| 6.2 | Character cosmetics | Costume changes (non-stat-affecting). | |
| 6.3 | Achievements | First 1000m, 100 relics in one run, etc. | |
| 6.4 | Gamepad support | Map to lane/jump/slide/turn actions. | |
| 6.5 | Daily seeded challenge | Fixed seed shared daily; leaderboard-free. | |
| 6.6 | Screenshot/share card | Renderable canvas snapshot with HUD. | |

**Exit:** Optional features for future development, not critical for P0 release.
---|-------------|------|
| 5.1 | Profile | 5.1 | Profile & optimize | Target: 60 FPS mainstream desktop, 30+ FPS mid-range phone. Profile draw calls, memory, GPU usage. |  optimize | Target: 60 FPS mainstream desktop, 30+ FPS mid-range phone. Profile draw calls, memory, GPU usage. | xfert|
| 5.2 | Graphics quality settings | Modes: Auto, Low, Medium, High. Adjust shadow resolution, texture DPR (1.0/1.5/2.0), particle count, effects. | | xfert
| 5.3 | Pooling review | Verify pools for track pieces, obstacle meshes, relic meshes, particle emitters, scenery. Recycle/dispose on retire. | | xfert
| 5.4 | Resize & aspect ratio | Canvas resizes to client dimensions; camera aspect & projection matrix updated. Safe-area insets respected. | | xfert
| 5.5 | Touch & safe-area testing | Portrait/landscape on mobile; no UI overlap with HUD or controls. | | xfert
| 5.6 | Background/resume & rotate | Simulation freeze on pause/blur; no large physics delta on resume. Rotation handled cleanly. | | xfert
| 5.7 | Memory growth check | Multiple restarts; no leaks from orphaned meshes, event listeners, or timers. | | xfert
| 5.8 | `vp check`/`vp test`/`vp build`/`vp preview` | All pass. `vp preview` smoked in browser. | | xfert
| 5.9 | Final README & AGENTS.md | Complete docs per PRD §12 (install, dev, test, check, build, preview commands; controls; asset structure; deployment). | | xfert
| 5.10 | Agent completion report | Document commands used, features delivered, test outcomes, remaining limitations. | | xfert

**Exit:** Production build works locally; all P0 acceptance criteria pass; docs are complete.

---

## ➕ Phase 6 — Stretch Features (P1/P2, optional)

| # | Task | Description | Done |
|---|------|-------------|------|
| 6.1 | Additional biomes | Weather/time changes, second/third distinct environments. | xfert |
| 6.2 | Character cosmetics | Costume changes (non-stat-affecting). | xfert |
| 6.3 | Achievements | First 1000m, 100 relics in one run, etc. | xfert |
| 6.4 | Gamepad support | Map to lane/jump/slide/turn actions. | xfert |
| 6.5 | Daily seeded challenge | Fixed seed shared daily; leaderboard-free. | xfert |
| 6.6 | Screenshot/share card | Renderable canvas snapshot with HUD. | xfert |

**Exit:** Optional features for future development, not critical for P0 release. |

---

## 🧪 Test Tasks (Cross-Cutting)

| # | Task | Description | Done |
|---|------|-------------|------|
| T.1 | Deterministic RNG test | Same seed yields identical segment sequence. | |
| T.2 | Lane boundary test | Commands ignored when lane would go out of bounds. | |
| T.3 | Jump arc test | Returns to ground without FPS dependence. | |
| T.4 | Slide collider test | Height change for correct duration (0.75s). | |
| T.5 | Collision variance test | Results vary by lane, posture, obstacle type, shield status. | |
| T.5 | Score/persistence test | Multiplier, magnet, shield, version migration correct. | |
| T.7 | Generator fairness test | No obviously unsolvable simple patterns emitted. | |
| T.8 | Reachability validator test | Rejects curated impossible obstacle/action sequences. | |
| T.9 | Turn-window semantics test | Early, late, matching, and wrong input handled correctly. | |
| T.10 | Seeded regression tests | Fixed-generation bug regression suite. |

**Run:** `vp test` — all pure function tests pass.

---

## ✅ Done Criteria — Release Checklist (PRD §14)

- [ ] Original 3D explorer visible and animated.
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

---
---

## Asset Integrity — 2026-11-16

- [x] Generated A01–A09 with the built-in `image_gen` tool and saved optimized local artwork under `public/assets/generated/`.
- [x] Supplied all 17 named outputs from `generate_prompts.md`, plus `fx-glow.webp` to meet the PRD's four-sprite A07 minimum: 18 raster assets total.
- [x] Used A10's preferred SVG alternative for four original directional runes; supplied editable SVGs and 128×128 transparent WebP exports. This is an explicitly permitted vector approach, not an image-tool failure fallback.
- [x] Preserved generator alpha, trimmed/centered icons, feathered VFX margins, and kept title/multiplier labels in DOM examples.
- [x] Corrected the explorer reference to a neutral background using a follow-up image edit. The PNG is concept art for procedural geometry, not an animated model.
- [x] Verified formats, dimensions, alpha, hashes, metadata and exact decoded opposite edges for both 512×512 albedo textures with `tools/assets/verify_assets.py`.
- [x] Recorded per-file prompts, origin, source exports, usage, dimensions, transparency, license notes, palette and payload in `public/assets/manifest.json`.
- [x] Production asset payload: 1,753,975 bytes (1.67 MiB), including concept and SVG sources; below the 12 MB target.
- [x] Browser asset smoke test: standalone `public/asset-review.html` decoded all 18 raster assets and four SVG alternatives successfully; every visible image had nonzero natural dimensions. The page demonstrates title and `2x` DOM overlays and repeating albedo textures.
- [x] Added a base-aware cached Three.js texture loader with sRGB, repeat wrapping, mipmaps, anisotropy, optional load failure handling and disposal. Its standalone library build passes.
- [ ] Wire all artwork into playable world geometry, HUD and VFX, convert the concept into an animated primitive character, and perform gameplay QA. The existing scaffold has no HTML entrypoint or world mesh renderer and contains unresolved module/runtime/state errors; see `tools/assets/README.md`.
- [ ] Project-wide `npm run check` and `npm run build`: existing formatting/tsconfig errors and missing `index.html` prevent these checks passing. The asset-only format, integrity and browser checks are recorded separately.

Review: run `node tools/assets/serve_review.mjs`, then open `http://127.0.0.1:8767/asset-review.html`. Offline contact sheet: `tools/assets/contact-sheet.jpg`.
