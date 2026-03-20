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
  autonPoints: 0,
  autonClimbLevel: 'L1',
  teleopPoints: 0,
  teleopClimbLevel: 'L1',
  playedDefense: false,
  accuracyPercentage: '0%',
  notes: ''
});

export const parseStoredEntries = (): ScoutEntry[] => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ScoutEntry[];
    return Array.isArray(parsed) ? parsed : [];
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
  autonomousSummary: '',
  teleopSummary: '',
  climbCapability: 'none',
  expectedRole: 'flex',
  notes: ''
});

export const parseStoredPitEntries = (): PitEntry[] => {
  const raw = localStorage.getItem(PIT_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as PitEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const validatePitForm = (scoutName: string, form: PitFormData): string | null => {
  if (!scoutName.trim()) return 'Scout name is required.';
  if (!form.teamNumber || form.teamNumber < 1) return 'Team number must be at least 1.';
  return null;
};