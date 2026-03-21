import { PitEntry, PitFormData, ScoutEntry, ScoutFormData } from './types';

export const LOCAL_STORAGE_KEY = 'scout-entries-v1';
export const PIT_STORAGE_KEY = 'pit-entries-v1';
export const SCOUT_NAME_KEY = 'scout-name-v1';

export const emptyForm = (scoutName: string): ScoutFormData => ({
  scoutName,
  matchNumber: 1,
  teamNumber: 0,
  startingPosition: 'trench',
  alliance: 'red',
  autonClimbLevel: 'none',
  teleopClimbLevel: 'none',
  playedDefense: false,
  teamPointsPercentage: 0,
  accuracyPercentage: 0,
  notes: ''
});

export const parseStoredEntries = (): ScoutEntry[] => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ScoutEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => ({
      ...entry,
      teamPointsPercentage: typeof entry.teamPointsPercentage === 'number' ? entry.teamPointsPercentage : 0,
      accuracyPercentage: typeof entry.accuracyPercentage === 'number' ? entry.accuracyPercentage : 0
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