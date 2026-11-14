export const PLANT_SPECIES = ['monstera', 'cactus', 'fern', 'sunflower', 'succulent'] as const;

export type PlantSpecies = (typeof PLANT_SPECIES)[number];

export const PLANT_SPECIES_LABEL: Record<PlantSpecies, string> = {
  monstera: 'Monstera',
  cactus: 'Cactus',
  fern: 'Fern',
  sunflower: 'Sunflower',
  succulent: 'Succulent',
};

const STAGE_LABELS = ['Seed', 'Sprout', 'Young', 'Growing', 'Thriving', 'In bloom'] as const;

/** A stable species per habit, so the garden looks varied but never reshuffles. */
export function plantSpeciesForHabit(habitId: number): PlantSpecies {
  const index =
    ((Math.abs(Math.trunc(habitId)) - 1) % PLANT_SPECIES.length + PLANT_SPECIES.length) %
    PLANT_SPECIES.length;
  return PLANT_SPECIES[index] ?? 'monstera';
}

export function plantStageLabel(stage: number): string {
  const clamped = Math.max(0, Math.min(5, Math.round(stage)));
  return STAGE_LABELS[clamped] ?? 'Seed';
}
