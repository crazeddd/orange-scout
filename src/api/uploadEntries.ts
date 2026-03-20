import { ScoutEntry } from '../model/types';

type UploadResponse = {
  result?: string;
  error?: string;
};

type UploadEntriesParams = {
  uploadUrl: string;
  uploadSecret: string;
  scoutName: string;
  pendingEntries: ScoutEntry[];
};

export const uploadEntries = async ({
  uploadUrl,
  uploadSecret,
  scoutName,
  pendingEntries
}: UploadEntriesParams): Promise<void> => {
  const payloadEntries = pendingEntries.map((entry) => ({
    scoutName: entry.scoutName,
    matchNumber: entry.matchNumber,
    teamNumber: entry.teamNumber,
    startingPosition: entry.startingPosition,
    alliance: entry.alliance,
    autonPoints: entry.autonPoints,
    autonClimbLevel: entry.autonClimbLevel,
    teleopPoints: entry.teleopPoints,
    teleopClimbLevel: entry.teleopClimbLevel,
    playedDefense: entry.playedDefense,
    accuracyPercentage: entry.accuracyPercentage,
    notes: entry.notes,
    createdAt: entry.createdAt
  }));

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      secret: uploadSecret,
      scoutName: pendingEntries[0]?.scoutName ?? scoutName.trim(),
      entries: payloadEntries,
      submission: payloadEntries
    })
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as UploadResponse) : null;

  if (!response.ok || json?.result === 'error') {
    throw new Error(json?.error ?? `Upload failed (${response.status}).`);
  }
};