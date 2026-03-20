import { CloudUpload, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PitEntry, ScoutEntry } from '../model/types';

type EntriesPageProps = {
  entries: ScoutEntry[];
  pitEntries: PitEntry[];
  pendingCount: number;
  uploading: boolean;
  uploadUrl: string;
  onUploadPending: () => void;
  onEditEntry: (entry: ScoutEntry) => void;
  onDeleteEntry: (id: string) => void;
  onEditPitEntry: (entry: PitEntry) => void;
  onDeletePitEntry: (id: string) => void;
};

export function EntriesPage({
  entries,
  pitEntries,
  pendingCount,
  uploading,
  uploadUrl,
  onUploadPending,
  onEditEntry,
  onDeleteEntry,
  onEditPitEntry,
  onDeletePitEntry
}: EntriesPageProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upload & Sync</CardTitle>
          <CardDescription>
            Pending: {pendingCount} / Total: {entries.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="uploadUrl">Google Script URL</Label>
            <Input id="uploadUrl" value={uploadUrl} disabled placeholder="Set VITE_GOOGLE_SCRIPT_URL" />
          </div>
          <Button onClick={onUploadPending} disabled={uploading || pendingCount === 0} className="w-full gap-2">
            <CloudUpload size={16} /> {uploading ? 'Uploading...' : 'Upload Pending Entries'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Scouting Entries</CardTitle>
          <CardDescription>View, edit, or delete before uploading.</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-[var(--txt-light)]">No entries saved yet.</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <article key={entry.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-light)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--txt)]">
                        Match {entry.matchNumber} • Team {entry.teamNumber}
                      </h3>
                      <p className="text-xs text-[var(--txt-dark)]">
                        Status: {entry.uploadedAt ? 'Uploaded' : 'Pending'} • Saved {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onEditEntry(entry)} className="gap-1">
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDeleteEntry(entry.id)} className="gap-1">
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Pit Entries</CardTitle>
          <CardDescription>Pit scouting records are also available here for quick edits and cleanup.</CardDescription>
        </CardHeader>
        <CardContent>
          {pitEntries.length === 0 ? (
            <p className="text-sm text-[var(--txt-light)]">No pit entries saved yet.</p>
          ) : (
            <div className="space-y-3">
              {pitEntries.map((entry) => (
                <article key={entry.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-light)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--txt)]">Team {entry.teamNumber}</h3>
                      <p className="text-xs text-[var(--txt-dark)]">Saved {new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onEditPitEntry(entry)} className="gap-1">
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDeletePitEntry(entry.id)} className="gap-1">
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}