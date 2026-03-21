export type Position = 'trench' | 'hub' | 'bump' | 'fender' | 'other';
export type Alliance = 'red' | 'blue';
export type ClimbLevel = 'L1' | 'L2' | 'L3' | 'none' | 'failed';
export type Drivetrain = 'swerve' | 'tank' | 'mecanum' | 'other';

export type ActivePage = 'entry' | 'entries' | 'pit';

export type AppMessage = {
  type: 'info' | 'success' | 'error';
  text: string;
};

export type ScoutEntry = {
  id: string;
  createdAt: string;
  uploadedAt?: string;
  scoutName: string;
  matchNumber: number;
  teamNumber: number;
  startingPosition: Position;
  alliance: Alliance;
  autonClimbLevel: ClimbLevel;
  teleopClimbLevel: ClimbLevel;
  playedDefense: boolean;
  teamPointsPercentage: number;
  accuracyPercentage: number;
  notes: string;
};

export type ScoutFormData = Omit<ScoutEntry, 'id' | 'createdAt' | 'uploadedAt'>;

export type PitEntry = {
  id: string;
  createdAt: string;
  uploadedAt?: string;
  scoutName: string;
  teamNumber: number;
  drivetrain: Drivetrain;
  fuelCapacity: number;
  autonomousSummary: string;
  teleopSummary: string;
  climbCapability: ClimbLevel;
  canGoUnderTrench: boolean;
  canGoOverBump: boolean;
  notes: string;
};

export type PitFormData = Omit<PitEntry, 'id' | 'createdAt' | 'uploadedAt'>;