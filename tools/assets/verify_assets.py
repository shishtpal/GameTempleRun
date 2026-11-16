"""Validate shipped assets independently of image_gen source exports."""
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "public/assets"
manifest = json.loads((BASE / "manifest.json").read_text(encoding="utf-8"))
expected = {
    "menu-sky-ruins.webp", "stone-albedo.webp", "brass-embossed.webp", "sky-islands.webp",
    "relic-shard.webp", "shield-icon.webp", "magnet-icon.webp", "multiplier-icon.webp",
    "fx-sparkle.webp", "fx-dustpuff.webp", "fx-streak.webp", "fx-glow.webp",
    "explorer-concept.png", "title-emblem.webp",
    "arrow-north.webp", "arrow-east.webp", "arrow-south.webp", "arrow-west.webp",
}
assert {a["filename"] for a in manifest["assets"]} == expected
for asset in manifest["assets"]:
    path = (BASE / asset["path"]).resolve()
    assert path.is_relative_to(BASE.resolve())
    assert path.stat().st_size == asset["bytes"]
    assert hashlib.sha256(path.read_bytes()).hexdigest() == asset["sha256"]
    for key in ("type", "use", "prompt", "origin", "license", "date"):
        assert asset[key], (path, key)
    with Image.open(path) as image:
        assert image.format == ("PNG" if path.suffix == ".png" else "WEBP")
        assert image.size == (asset["dimensions"]["width"], asset["dimensions"]["height"])
        pixels = np.array(image.convert("RGBA"))
        a = pixels[:, :, 3]
        assert bool(a.min() < 255) == asset["transparency"]
        if asset["transparency"]:
            assert a.min() == 0 and a.max() > 0
            assert ((a > 0) & (a < 255)).sum() > 0
            assert not any((a[0].any(), a[-1].any(), a[:, 0].any(), a[:, -1].any()))
        if asset["type"] == "albedo":
            assert np.array_equal(pixels[0], pixels[-1])
            assert np.array_equal(pixels[:, 0], pixels[:, -1])
    if "vectorSource" in asset:
        vector = ET.parse(BASE / asset["vectorSource"]).getroot()
        assert vector.attrib["viewBox"] == "0 0 128 128"
        assert len(list(vector.iter("{http://www.w3.org/2000/svg}text"))) == 0
payload = sum(p.stat().st_size for p in (BASE / "generated").iterdir() if p.is_file())
assert payload == manifest["productionBytes"] < 12_000_000
print(f"PASS: {len(expected)} raster assets, 4 SVGs, dimensions/formats/alpha/hashes/metadata, exact albedo edges; {payload:,} bytes.")
