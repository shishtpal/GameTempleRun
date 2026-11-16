import {
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
  type WebGLRenderer,
} from "three";

const filenames = {
  menu: "menu-sky-ruins.webp",
  stone: "stone-albedo.webp",
  brass: "brass-embossed.webp",
  sky: "sky-islands.webp",
  relic: "relic-shard.webp",
  shield: "shield-icon.webp",
  magnet: "magnet-icon.webp",
  multiplier: "multiplier-icon.webp",
  sparkle: "fx-sparkle.webp",
  dust: "fx-dustpuff.webp",
  streak: "fx-streak.webp",
  glow: "fx-glow.webp",
  explorerConcept: "explorer-concept.png",
  emblem: "title-emblem.webp",
  north: "arrow-north.webp",
  east: "arrow-east.webp",
  south: "arrow-south.webp",
  west: "arrow-west.webp",
} as const;

export type GeneratedAsset = keyof typeof filenames;

/** Relative to Vite's configured base, including deployments in a subdirectory. */
export function assetUrl(name: GeneratedAsset): string {
  return `${import.meta.env.BASE_URL}assets/generated/${filenames[name]}`;
}

/** Shared color-texture cache. A missing optional texture leaves material colors usable. */
export class GeneratedAssets {
  private loader = new TextureLoader();
  private textures = new Map<GeneratedAsset, Promise<Texture | null>>();

  constructor(private renderer: WebGLRenderer) {}

  load(name: GeneratedAsset): Promise<Texture | null> {
    const cached = this.textures.get(name);
    if (cached) return cached;
    const pending = this.loader.loadAsync(assetUrl(name)).then(
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        texture.magFilter = LinearFilter;
        texture.minFilter = LinearMipmapLinearFilter;
        texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
        if (name === "stone" || name === "brass") {
          texture.wrapS = texture.wrapT = RepeatWrapping;
        }
        return texture;
      },
      () => null,
    );
    this.textures.set(name, pending);
    return pending;
  }

  dispose(): void {
    for (const pending of this.textures.values()) {
      void pending.then((texture) => texture?.dispose());
    }
    this.textures.clear();
  }
}
