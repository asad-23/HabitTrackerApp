import { PLANT_SPECIES, plantSpeciesForHabit, plantStageLabel } from './plants';

describe('plantSpeciesForHabit', () => {
  it('is stable for the same habit', () => {
    expect(plantSpeciesForHabit(7)).toBe(plantSpeciesForHabit(7));
  });

  it('cycles through every species as habits are added', () => {
    const species = PLANT_SPECIES.map((_, index) => plantSpeciesForHabit(index + 1));
    expect(new Set(species).size).toBe(PLANT_SPECIES.length);
    expect(plantSpeciesForHabit(PLANT_SPECIES.length + 1)).toBe(plantSpeciesForHabit(1));
  });

  it('always returns a known species, even for odd ids', () => {
    for (const id of [0, -1, -12, 999]) {
      expect(PLANT_SPECIES).toContain(plantSpeciesForHabit(id));
    }
  });
});

describe('plantStageLabel', () => {
  it('names each stage', () => {
    expect(plantStageLabel(0)).toBe('Seed');
    expect(plantStageLabel(3)).toBe('Growing');
    expect(plantStageLabel(5)).toBe('In bloom');
  });

  it('clamps values outside the range', () => {
    expect(plantStageLabel(-2)).toBe('Seed');
    expect(plantStageLabel(9)).toBe('In bloom');
  });
});
