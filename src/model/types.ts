export type Position = 'trench' | 'hub' | 'bump';
export type Alliance = 'red' | 'blue';
export type ClimbLevel = 'L1' | 'L2' | 'L3';
export type Accuracy = '0%' | '25%' | '50%' | '75%' | '100%';
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
  autonPoints: number;
  autonClimbLevel: ClimbLevel;
  teleopPoints: number;
  teleopClimbLevel: ClimbLevel;
  playedDefense: boolean;
  accuracyPercentage: Accuracy;
  notes: string;
};

export type ScoutFormData = Omit<ScoutEntry, 'id' | 'createdAt' | 'uploadedAt'>;

export type PitEntry = {
  id: string;
  createdAt: string;
  scoutName: string;
  teamNumber: number;
  drivetrain: Drivetrain;
  autonomousSummary: string;
  teleopSummary: string;
  climbCapability: ClimbLevel | 'none';
  expectedRole: 'offense' | 'defense' | 'flex';
  notes: string;
};

export type PitFormData = Omit<PitEntry, 'id' | 'createdAt'>;