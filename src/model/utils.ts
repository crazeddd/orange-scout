import { PitEntry, PitFormData, Position, ScoutEntry, ScoutFormData } from './types';

export const LOCAL_STORAGE_KEY = 'scout-entries-v1';
export const PIT_STORAGE_KEY = 'pit-entries-v1';
export const SCOUT_NAME_KEY = 'scout-name-v1';

export const emptyForm = (scoutName: string): ScoutFormData => ({
  scoutName,
  matchNumber: 0,
  teamNumber: 0,
  startingPosition: 'trench (left)',
  alliance: 'red',
  autonClimbLevel: 'none',
  teleopClimbLevel: 'none',
  playedDefense: false,
  disconnected: false,
  noShow: false,
  autoScoringCategory: 'low',
  scoringCategory: 'low',
  missedBallsPerCycle: 0,
  shootingAccuracy: 0,
  drivingQuality: 'average',
  drivingQualityNotes: '',
  autoPathSketch: '',
  defenseRating: 0,
  passedFuel: false,
  passedFuelAmount: 0,
  usedCorral: false,
  notes: ''
});

export const parseStoredEntries = (): ScoutEntry[] => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ScoutEntry[];
    if (!Array.isArray(parsed)) return [];
    const normalizeStartingPosition = (position: unknown): Position => {
      if (position === 'hub') return 'hub';
      if (position === 'trench' || position === 'trench (left)') return 'trench (left)';
      if (position === 'fender' || position === 'trench (right)') return 'trench (right)';
      if (position === 'bump' || position === 'bump (left)') return 'bump (left)';
      if (position === 'other' || position === 'bump (right)') return 'bump (right)';
      return 'trench (left)';
    };

    return parsed.map((entry) => ({
      ...entry,
      startingPosition: normalizeStartingPosition(entry.startingPosition),
      disconnected: typeof entry.disconnected === 'boolean' ? entry.disconnected : false,
      noShow: typeof entry.noShow === 'boolean' ? entry.noShow : false,
      autoScoringCategory:
        entry.autoScoringCategory === 'high' ||
        entry.autoScoringCategory === 'medium' ||
        entry.autoScoringCategory === 'low'
          ? entry.autoScoringCategory
          : 'low',
      scoringCategory:
        entry.scoringCategory === 'high' || entry.scoringCategory === 'medium' || entry.scoringCategory === 'low'
          ? entry.scoringCategory
          : 'low',
      missedBallsPerCycle: typeof entry.missedBallsPerCycle === 'number' ? entry.missedBallsPerCycle : 0,
      shootingAccuracy: typeof entry.shootingAccuracy === 'number' ? entry.shootingAccuracy : 0,
      drivingQuality:
        entry.drivingQuality === 'good' || entry.drivingQuality === 'average' || entry.drivingQuality === 'bad'
          ? entry.drivingQuality
          : 'average',
      drivingQualityNotes: typeof entry.drivingQualityNotes === 'string' ? entry.drivingQualityNotes : '',
      autoPathSketch: typeof entry.autoPathSketch === 'string' ? entry.autoPathSketch : '',
      defenseRating: typeof entry.defenseRating === 'number' ? entry.defenseRating : 0,
      passedFuel: typeof entry.passedFuel === 'boolean' ? entry.passedFuel : false,
      passedFuelAmount: typeof entry.passedFuelAmount === 'number' ? entry.passedFuelAmount : 0,
      usedCorral: typeof entry.usedCorral === 'boolean' ? entry.usedCorral : false
    }));
  } catch {
    return [];
  }
};

export const parseNumberInput = (value: string, min = 0): number => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return min;
  const parsed = Number.parseInt(digits, 10);
  if (Number.isNaN(parsed)) return min;
  return Math.max(min, parsed);
};

export const validateForm = (scoutName: string, form: ScoutFormData): string | null => {
  if (!scoutName.trim()) return 'Scout name is required.';
  if (!form.matchNumber || form.matchNumber < 1) return 'Match number must be at least 1.';
  if (!form.teamNumber || form.teamNumber < 1) return 'Team number must be at least 1.';
  return null;
};

export const emptyPitForm = (scoutName = ''): PitFormData => ({
  scoutName,
  teamNumber: 0,
  drivetrain: 'swerve',
  gearRatio: '',
  fuelCapacity: 0,
  autonomousSummary: '',
  teleopSummary: '',
  climbCapability: 'none',
  canGoUnderTrench: false,
  canGoOverBump: false,
  notes: ''
});

export const parseStoredPitEntries = (): PitEntry[] => {
  const raw = localStorage.getItem(PIT_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as PitEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => ({
      ...entry,
      gearRatio: typeof entry.gearRatio === 'string' ? entry.gearRatio : '',
      fuelCapacity: typeof entry.fuelCapacity === 'number' ? entry.fuelCapacity : 0,
      canGoUnderTrench: typeof entry.canGoUnderTrench === 'boolean' ? entry.canGoUnderTrench : false,
      canGoOverBump: typeof entry.canGoOverBump === 'boolean' ? entry.canGoOverBump : false
    }));
  } catch {
    return [];
  }
};

export const validatePitForm = (scoutName: string, form: PitFormData): string | null => {
  if (!scoutName.trim()) return 'Scout name is required.';
  if (!form.teamNumber || form.teamNumber < 1) return 'Team number must be at least 1.';
  return null;
};