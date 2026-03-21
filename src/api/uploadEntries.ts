import { PitEntry, ScoutEntry } from '../model/types';

type UploadResponse = {
  result?: string;
  error?: string;
};

type UploadEntriesParams = {
  uploadUrl: string;
  scoutName: string;
  pendingEntries: ScoutEntry[];
  pendingPitEntries?: PitEntry[];
};

const CHUNK_SIZE = 50;

const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const uploadEntries = async ({
  uploadUrl,
  scoutName,
  pendingEntries,
  pendingPitEntries = []
}: UploadEntriesParams): Promise<void> => {
  const payloadScoutEntries = pendingEntries.map((entry) => ({
    type: 'scout',
    scoutName: entry.scoutName,
    matchNumber: entry.matchNumber,
    teamNumber: entry.teamNumber,
    startingPosition: entry.startingPosition,
    alliance: entry.alliance,
    autonClimbLevel: entry.autonClimbLevel,
    teleopClimbLevel: entry.teleopClimbLevel,
    playedDefense: entry.playedDefense,
    teamPointsPercentage: entry.teamPointsPercentage ?? 0,
    accuracyPercentage: entry.accuracyPercentage ?? 0,
    notes: entry.notes,
    createdAt: entry.createdAt
  }));

  const payloadPitEntries = pendingPitEntries.map((entry) => ({
    type: 'pit',
    scoutName: entry.scoutName,
    teamNumber: entry.teamNumber,
    drivetrain: entry.drivetrain,
    fuelCapacity: entry.fuelCapacity ?? 0,
    autonomousSummary: entry.autonomousSummary,
    teleopSummary: entry.teleopSummary,
    climbCapability: entry.climbCapability,
    canGoUnderTrench: entry.canGoUnderTrench ?? false,
    canGoOverBump: entry.canGoOverBump ?? false,
    notes: entry.notes,
    createdAt: entry.createdAt
  }));

  const allPayloads = [...payloadScoutEntries, ...payloadPitEntries];
  const chunks = chunkArray(allPayloads, CHUNK_SIZE);

  if (chunks.length === 0) {
    throw new Error('No entries to upload.');
  }

  for (const chunk of chunks) {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: JSON.stringify({
        scoutName: scoutName.trim(),
        entries: chunk,
        submission: chunk
      })
    });

    const text = await response.text();
    const json = text ? (JSON.parse(text) as UploadResponse) : null;

    if (!response.ok || json?.result === 'error') {
      throw new Error(json?.error ?? `Upload failed (${response.status}).`);
    }
  }
};