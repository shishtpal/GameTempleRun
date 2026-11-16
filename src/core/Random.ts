/**
 * Mulberry32 deterministic pseudo-random number generator.
 * Same seed always yields same sequence - essential for reproducible gameplay.
 */

export class Random {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed >>> 0; // force 32-bit
  }

  /** Generate next unsigned 32-bit integer */
  private mulberry32(): number {
    let t = this.seed + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + 0xbd1e0000;
    t = Math.imul(t ^ (t >>> 13), t | 1);
    t ^= t + 0x84cceee1;
    t ^= t >>> 16;
    this.seed = t;
    return (t >>> 0) / 0xffffffff;
  }

  /** Return float in [0, 1) */
  float(min = 0, max = 1): number {
    return min + (max - min) * this.mulberry32();
  }

  /** Return integer in [min, max] inclusive */
  intInRange(min: number, max: number): number {
    return Math.floor(this.float(min, max + 1));
  }

  /** Return boolean with 50% probability */
  bool(): boolean {
    return this.mulberry32() < 0.5;
  }
}
