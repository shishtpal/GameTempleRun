"""Normalize image_gen exports. Usage: python tools/assets/process_assets.py SOURCE_DIR.

Requires Pillow and numpy. Source files stay in image_gen's export directory;
only optimized game assets are placed in public/. No image API is called here.
"""

import argparse
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/assets/generated"
GLOBAL = (
    "Original stylized 3D adventure game art, floating sky ruins, warm golden-hour "
    "lighting, weathered sandstone, oxidized brass, luminous turquoise crystals, "
    "crisp silhouettes, readable colors, cohesive painterly low-poly aesthetic, "
    "no copyrighted characters, no logo, no watermark, no letters. "
)
SPECS = [
    ("a01", "menu-sky-ruins.webp", (1600, 900), False, "background", "Title/menu background"),
    ("a02", "stone-albedo.webp", (512, 512), False, "albedo", "Bridge and ruins color map"),
    ("a03", "brass-embossed.webp", (512, 512), False, "albedo", "Trap and machinery color map"),
    ("a04", "sky-islands.webp", (1680, 720), False, "background", "Atmospheric sky background"),
    ("a05", "relic-shard.webp", (256, 256), True, "icon", "HUD and pickup billboard reference"),
    ("a06-shield", "shield-icon.webp", (256, 256), True, "icon", "Shield power-up HUD"),
    ("a06-magnet", "magnet-icon.webp", (256, 256), True, "icon", "Magnet power-up HUD"),
    ("a06-multiplier", "multiplier-icon.webp", (256, 256), True, "icon", "Multiplier HUD; overlay real 2x text in DOM"),
    ("a07-sparkle", "fx-sparkle.webp", (256, 256), True, "sprite", "Relic pickup sparkle"),
    ("a07-dust", "fx-dustpuff.webp", (256, 256), True, "sprite", "Jump and landing dust"),
    ("a07-streak", "fx-streak.webp", (256, 256), True, "sprite", "Slide and speed streak"),
    ("a07-glow", "fx-glow.webp", (256, 256), True, "sprite", "Shield and multiplier glow burst; fourth PRD VFX sprite"),
    ("a08", "explorer-concept.png", (512, 768), False, "concept", "Style reference only; recreate with Three.js primitives"),
    ("a09", "title-emblem.webp", (512, 512), True, "emblem", "Menu decoration; overlay real title in DOM"),
]


def prompt_for(key):
    text = (ROOT / "generate_prompts.md").read_text(encoding="utf-8")
    batch = key[:3].upper()
    section = re.search(rf"## {batch} .*?(?=\n## |\Z)", text, re.S).group()
    prompts = re.findall(r"^> (.+)$", section, re.M)
    index = {"a06-shield": 0, "a06-magnet": 1, "a06-multiplier": 2,
             "a07-sparkle": 0, "a07-dust": 1, "a07-streak": 2}.get(key, 0)
    prompt = prompts[index]
    if key == "a07-glow":
        prompt = "Single soft circular magical turquoise glow burst, luminous pale core, subtle radial aura, no rays or stars, smooth alpha fade, fully transparent background, no objects, 1:1."
    if key == "a06-multiplier":
        prompt = "Single brass multiplier framework with turquoise accents and EMPTY dark turquoise center for real HTML/CSS 2x text; no embedded letters or numbers; centered, crisp silhouette, transparent background, 1:1."
    return GLOBAL + prompt


def periodic_edges(image, band=24):
    """Blend paired boundary strips; retain the generated center and dimensions."""
    a = np.asarray(image.convert("RGB"), dtype=np.float32).copy()
    for axis in (1, 0):
        for i in range(band):
            first = [slice(None)] * 3
            last = [slice(None)] * 3
            first[axis], last[axis] = i, -1 - i
            first, last = tuple(first), tuple(last)
            low, high = a[first].copy(), a[last].copy()
            weight = 0.5 * (1 - i / band) ** 2
            a[first] = low * (1 - weight) + high * weight
            a[last] = high * (1 - weight) + low * weight
    return Image.fromarray(np.rint(a).astype(np.uint8))


def centered_alpha(image, size, sprite):
    image = image.convert("RGBA")
    bounds = image.getchannel("A").point(lambda a: 255 if a > 3 else 0).getbbox()
    if not bounds or image.getchannel("A").getextrema()[0] != 0:
        raise ValueError("Generator did not export usable transparency")
    x0, y0, x1, y1 = bounds
    bounds = (max(0, x0 - 8), max(0, y0 - 8), min(image.width, x1 + 8), min(image.height, y1 + 8))
    image = image.crop(bounds)
    inner = round(size[0] * 0.88)
    image.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size)
    canvas.alpha_composite(image, ((size[0] - image.width) // 2, (size[1] - image.height) // 2))
    if sprite:
        # Preserve generator alpha; feather only the outside of its support.
        a = np.array(canvas)
        y, x = np.mgrid[:size[1], :size[0]]
        distance = np.minimum.reduce([x, y, size[0] - 1 - x, size[1] - 1 - y])
        fade = np.clip((distance - size[0] * 0.06) / (size[0] * 0.08), 0, 1)
        a[:, :, 3] = np.rint(a[:, :, 3] * fade).astype(np.uint8)
        canvas = Image.fromarray(a)
    return canvas


def metrics(path, alpha, tile=False):
    with Image.open(path) as image:
        rgba = np.asarray(image.convert("RGBA"))
        result = {"dimensions": {"width": image.width, "height": image.height},
                  "transparency": bool(rgba[:, :, 3].min() < 255),
                  "bytes": path.stat().st_size,
                  "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
        if alpha:
            a = rgba[:, :, 3]
            assert a.min() == 0 and a.max() > 0 and ((a > 0) & (a < 255)).any(), path
            assert max(a[0].max(), a[-1].max(), a[:, 0].max(), a[:, -1].max()) == 0, path
            result["alphaVerified"] = True
        if tile:
            rgb = rgba[:, :, :3].astype(int)
            seam = {"leftRightMaxDelta": int(abs(rgb[:, 0] - rgb[:, -1]).max()),
                    "topBottomMaxDelta": int(abs(rgb[0] - rgb[-1]).max())}
            assert max(seam.values()) == 0, seam
            result["tiling"] = seam
        return result


def arrow(direction, angle):
    # Editable SVG and matching high-resolution raster, same original path.
    path = "M64 12 108 58 81 58 81 110 47 110 47 58 20 58Z"
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="brass" x2="0.4" y2="1"><stop stop-color="#efca77"/><stop offset="1" stop-color="#95662f"/></linearGradient></defs><g transform="rotate({angle} 64 64)"><path d="{path}" fill="url(#brass)" stroke="#183e40" stroke-width="5" stroke-linejoin="round"/><path d="M64 29 89 55H71V96H57V55H39Z" fill="#42e5cf"/><path d="M61 69H67M61 80H67" stroke="#176d71" stroke-width="3"/><path d="M64 35 73 46H55Z" fill="#d6fff0"/></g></svg>'''
    (OUT / f"arrow-{direction}.svg").write_text(svg, encoding="utf-8")
    scale = 4
    image = Image.new("RGBA", (128 * scale, 128 * scale))
    draw = ImageDraw.Draw(image)
    def poly(points, fill):
        draw.polygon([(x * scale, y * scale) for x, y in points], fill=fill)
    poly([(64, 9), (113, 61), (84, 61), (84, 113), (44, 113), (44, 61), (15, 61)], "#183e40")
    poly([(64, 14), (104, 56), (79, 56), (79, 108), (49, 108), (49, 56), (24, 56)], "#c69a50")
    poly([(64, 29), (89, 55), (71, 55), (71, 96), (57, 96), (57, 55), (39, 55)], "#42e5cf")
    poly([(64, 35), (73, 46), (55, 46)], "#d6fff0")
    for y in (69, 80):
        draw.line((61 * scale, y * scale, 67 * scale, y * scale), fill="#176d71", width=3 * scale)
    image = image.rotate(-angle).resize((128, 128), Image.Resampling.LANCZOS)
    image.save(OUT / f"arrow-{direction}.webp", lossless=True, method=6)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_dir", type=Path)
    args = parser.parse_args()
    sources = json.loads((Path(__file__).parent / "sources.json").read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    assets = []
    for key, filename, size, alpha, kind, use in SPECS:
        source = args.source_dir / sources[key]
        image = Image.open(source)
        if alpha:
            image = centered_alpha(image, size, kind == "sprite")
        else:
            image = ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS)
        tile = kind == "albedo"
        if tile:
            image = periodic_edges(image)
        target = OUT / filename
        if target.suffix == ".png":
            image.save(target, optimize=True)
        else:
            image.save(target, quality=85 if kind == "background" else 90,
                       lossless=tile, alpha_quality=100, method=6)
        notes = "Generated with built-in image_gen; resized and optimized locally."
        if alpha:
            notes += " Original alpha retained; content trimmed and centered with transparent padding."
        if tile:
            notes += " 24px periodic boundary blend; lossless WebP; decoded opposite edge pixels match exactly. Albedo only, not PBR/normal/height data."
        if key == "a08":
            notes += " Follow-up image_gen edit removed scenery in favor of a plain neutral studio background; reference only, not an animated model."
        assets.append({"id": key.upper(), "filename": filename, "path": "generated/" + filename,
                       "type": kind, "use": use, "prompt": prompt_for(key),
                       "promptSource": "generate_prompts.md#" + key[:3].upper(),
                       "origin": "generate_image", "tool": "built-in image_gen",
                       "sourceExport": sources[key], "date": "2026-11-16",
                       "license": "Original AI-generated project artwork; no third-party game assets. No exclusivity or copyrightability claim.",
                       "notes": notes, **metrics(target, alpha, tile)})
    for direction, angle in (("north", 0), ("east", 90), ("south", 180), ("west", 270)):
        arrow(direction, angle)
        filename = f"arrow-{direction}.webp"
        assets.append({"id": "A10-" + direction.upper(), "filename": filename,
                       "path": "generated/" + filename, "vectorSource": f"generated/arrow-{direction}.svg",
                       "type": "indicator", "use": direction + " turn indicator",
                       "prompt": GLOBAL + "Crisp directional arrow rune, brass outline, turquoise inset and carved marks, transparent background, 1:1.",
                       "origin": "procedural", "date": "2026-11-16",
                       "license": "Original project-authored SVG and raster artwork; same license as project code.",
                       "notes": "Preferred CSS/SVG alternative explicitly permitted by A10; WebP supplied for texture use.",
                       **metrics(OUT / filename, True)})
    sky = Image.open(OUT / "sky-islands.webp").convert("RGB").quantize(colors=8)
    palette = sky.getpalette()
    colors = ["#%02x%02x%02x" % tuple(palette[i * 3:i * 3 + 3]) for _, i in sorted(sky.getcolors(), reverse=True)]
    manifest = {"schemaVersion": 1, "generatedAt": datetime.now(timezone.utc).isoformat(),
                "assets": assets, "palette": colors,
                "productionBytes": sum(p.stat().st_size for p in OUT.iterdir() if p.is_file()),
                "notes": "A01-A09 built-in image_gen artwork; A10 preferred SVG alternative plus WebP. Four VFX sprites satisfy PRD 7.1. Title and 2x labels belong in DOM. Concept is reference only."}
    assert manifest["productionBytes"] < 12_000_000
    (ROOT / "public/assets/manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    # Small contact sheet to inspect normalized output against a dark background.
    sheet = Image.new("RGB", (1000, 280 * 5), "#102b35")
    draw = ImageDraw.Draw(sheet)
    for i, asset in enumerate(assets):
        x, y = (i % 4) * 250, (i // 4) * 280
        image = Image.open(OUT / asset["filename"]).convert("RGBA")
        image.thumbnail((230, 235), Image.Resampling.LANCZOS)
        sheet.paste(image, (x + (250 - image.width) // 2, y + 8 + (235 - image.height) // 2), image)
        draw.text((x + 10, y + 250), asset["filename"], fill="#d6ede7")
    sheet.save(ROOT / "tools/assets/contact-sheet.jpg", quality=90)
    print(json.dumps({"assets": len(assets), "productionBytes": manifest["productionBytes"], "palette": colors}))


if __name__ == "__main__":
    main()
