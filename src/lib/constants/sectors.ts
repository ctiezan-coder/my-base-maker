export const ACTIVITY_SECTORS = [
  "Agroalimentaire",
  "Cosmétiques",
  "Textile",
  "Technologies",
  "Artisanat",
  "Services",
  "Industries",
  "Commerce",
] as const;

export type ActivitySector = typeof ACTIVITY_SECTORS[number];
