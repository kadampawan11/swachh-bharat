export const COMPLAINT_CATEGORIES = [
  'GARBAGE', 'DRAIN', 'ROAD', 'TOILET',
  'OPEN_DEFECATION', 'WATER_LOGGING', 'DEBRIS', 'OTHER',
] as const;
export type ComplaintCategory = typeof COMPLAINT_CATEGORIES[number];
export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  GARBAGE: 'Garbage Dumping',
  DRAIN: 'Drain / Sewage',
  ROAD: 'Road Damage',
  TOILET: 'Public Toilet',
  OPEN_DEFECATION: 'Open Defecation',
  WATER_LOGGING: 'Water Logging',
  DEBRIS: 'Debris / Construction Waste',
  OTHER: 'Other',
};
