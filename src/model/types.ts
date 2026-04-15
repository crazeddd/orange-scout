export type Position = 'hub' | 'trench (left)' | 'trench (right)' | 'bump (left)' | 'bump (right)';
export type Alliance = 'red' | 'blue';
export type ClimbLevel = 'L1' | 'L2' | 'L3' | 'none' | 'failed';
export type Drivetrain = 'swerve' | 'tank' | 'other';
export type ScoringCategory = 'low' | 'medium' | 'high';
export type DrivingQuality = 'good' | 'average' | 'bad';

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
  disconnected: boolean;
  noShow: boolean;
  autoScoringCategory: ScoringCategory;
  scoringCategory: ScoringCategory;
  missedBallsPerCycle: number;
  shootingAccuracy: number;
  drivingQuality: DrivingQuality;
  drivingQualityNotes: string;
  defenseRating: number;
  passedFuel: boolean;
  passedFuelAmount: number;
  usedCorral: boolean;
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
  gearRatio: string;
  fuelCapacity: number;
  autonomousSummary: string;
  teleopSummary: string;
  climbCapability: ClimbLevel;
  canGoUnderTrench: boolean;
  canGoOverBump: boolean;
  notes: string;
};

export type PitFormData = Omit<PitEntry, 'id' | 'createdAt' | 'uploadedAt'>;