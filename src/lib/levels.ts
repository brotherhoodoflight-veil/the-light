export const LEVELS = [
  { level: 1, title: "Neophyte" },
  { level: 2, title: "Acolyte" },
  { level: 3, title: "Adept" },
  { level: 4, title: "Disciple" },
  { level: 5, title: "Theurgist" },
  { level: 6, title: "Mystic" },
  { level: 7, title: "Magus" },
  { level: 8, title: "High Adept" },
  { level: 9, title: "Supreme IX" },
] as const;

export const HIGH_CIRCLE = 10;

export const REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
] as const;

export function levelTitle(level: number): string {
  return LEVELS.find((l) => l.level === level)?.title ?? "Veiled";
}

export function levelLabel(level: number): string {
  return `Level ${level} · ${levelTitle(level)}`;
}