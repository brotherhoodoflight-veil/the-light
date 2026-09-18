export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SigilSpec {
  points: number;
  satellites: number;
  radius: number;
  rotation: number;
  glyphs: boolean;
}

export function sigilSpec(seed: string): SigilSpec {
  const rnd = mulberry32(hashString(seed));
  return {
    points: 3 + Math.floor(rnd() * 7),
    satellites: 4 + Math.floor(rnd() * 10),
    radius: 30 + Math.floor(rnd() * 12),
    rotation: Math.floor(rnd() * 360),
    glyphs: rnd() > 0.4,
  };
}

export function polygonPoints(
  count: number,
  radius: number,
  rotation: number,
  cx: number,
  cy: number,
): Array<[number, number]> {
  const step = 360 / count;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    const rad = (Math.PI / 180) * (rotation + i * step);
    pts.push([cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)]);
  }
  return pts;
}

export function starPolygon(
  count: number,
  outer: number,
  rotation: number,
  cx: number,
  cy: number,
): string {
  const inner = outer * 0.42;
  const step = 360 / (count * 2);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < count * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const rad = (Math.PI / 180) * (rotation + i * step);
    pts.push([cx + r * Math.cos(rad), cy + r * Math.sin(rad)]);
  }
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(" ") + " Z";
}