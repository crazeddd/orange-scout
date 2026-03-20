import { useEffect, useMemo, useState } from 'react';
import { EntriesPage } from './pages/EntriesPage';
import { ScoutingPage } from './pages/ScoutingPage';
import { PitScoutingPage } from './pages/PitScoutingPage';
import { SidebarNav } from './components/SidebarNav';
import { AppToaster, showAppToast } from './components/ui/sonner';
import { uploadEntries } from './api/uploadEntries';
import { ActivePage, AppMessage, PitEntry, PitFormData, ScoutEntry, ScoutFormData } from './model/types';
import {
  LOCAL_STORAGE_KEY,
  PIT_STORAGE_KEY,
  SCOUT_NAME_KEY,
  emptyForm,
  emptyPitForm,
  parseStoredEntries,
  parseStoredPitEntries,
  validateForm,
  validatePitForm
} from './model/utils';

function App() {
  const [entries, setEntries] = useState<ScoutEntry[]>([]);
  const [pitEntries, setPitEntries] = useState<PitEntry[]>([]);
  const [scoutName, setScoutName] = useState(() => localStorage.getItem(SCOUT_NAME_KEY) ?? '');
  const [form, setForm] = useState<ScoutFormData>(emptyForm(''));
  const [pitForm, setPitForm] = useState<PitFormData>(emptyPitForm(''));
  const [activePage, setActivePage] = useState<ActivePage>('entry');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPitId, setEditingPitId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<AppMessage | null>(null);
  const [pitStatusMessage, setPitStatusMessage] = useState<AppMessage | null>(null);

  const uploadUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  const uploadSecret = import.meta.env.VITE_UPLOAD_SECRET ?? '';

  useEffect(() => {
    setEntries(parseStoredEntries());
    setPitEntries(parseStoredPitEntries());
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(PIT_STORAGE_KEY, JSON.stringify(pitEntries));
  }, [pitEntries]);

  useEffect(() => {
    localStorage.setItem(SCOUT_NAME_KEY, scoutName);
    setForm((prev) => ({ ...prev, scoutName }));
    setPitForm((prev) => ({ ...prev, scoutName }));
  }, [scoutName]);

  useEffect(() => {
    if (!statusMessage) return;
    showAppToast(statusMessage);
  }, [statusMessage]);

  useEffect(() => {
    if (!pitStatusMessage) return;
    showAppToast(pitStatusMessage);
  }, [pitStatusMessage]);

  const pendingEntries = useMemo(() => entries.filter((entry) => !entry.uploadedAt), [entries]);

  const resetForm = (name: string) => {
    setForm(emptyForm(name));
    setEditingId(null);
  };

  const updateForm = <K extends keyof ScoutFormData>(key: K, value: ScoutFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePitForm = <K extends keyof PitFormData>(key: K, value: PitFormData[K]) => {
    setPitForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const validationError = validateForm(scoutName, form);
    if (validationError) {
      setStatusMessage({ type: 'error', text: validationError });
      return;
    }

    const normalized: ScoutFormData = {
      ...form,
      scoutName: scoutName.trim()
    };

    if (editingId) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingId ? { ...entry, ...normalized, uploadedAt: undefined } : entry
        )
      );
      setStatusMessage({ type: 'success', text: 'Entry updated.' });
    } else {
      const newEntry: ScoutEntry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...normalized
      };
      setEntries((prev) => [newEntry, ...prev]);
      setStatusMessage({ type: 'success', text: 'Entry saved locally.' });
    }

    resetForm(scoutName.trim());
  };

  const startEdit = (entry: ScoutEntry) => {
    setActivePage('entry');
    setEditingId(entry.id);
    setForm({
      scoutName,
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
      notes: entry.notes
    });
    setStatusMessage({ type: 'info', text: 'Editing selected entry.' });
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    if (editingId === id) {
      resetForm(scoutName);
    }
    setStatusMessage({ type: 'info', text: 'Entry deleted.' });
  };

  const resetPitForm = () => {
    setPitForm(emptyPitForm(scoutName));
    setEditingPitId(null);
  };

  const handleSavePitEntry = () => {
    const validationError = validatePitForm(scoutName, pitForm);
    if (validationError) {
      setPitStatusMessage({ type: 'error', text: validationError });
      return;
    }

    const normalized: PitFormData = {
      ...pitForm,
      scoutName: scoutName.trim()
    };

    if (editingPitId) {
      setPitEntries((prev) => prev.map((entry) => (entry.id === editingPitId ? { ...entry, ...normalized } : entry)));
      setPitStatusMessage({ type: 'success', text: 'Pit entry updated.' });
    } else {
      const newEntry: PitEntry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...normalized
      };
      setPitEntries((prev) => [newEntry, ...prev]);
      setPitStatusMessage({ type: 'success', text: 'Pit entry saved.' });
    }

    resetPitForm();
  };

  const editPitEntry = (entry: PitEntry) => {
    setActivePage('pit');
    setEditingPitId(entry.id);
    setPitForm({
      scoutName,
      teamNumber: entry.teamNumber,
      drivetrain: entry.drivetrain,
      autonomousSummary: entry.autonomousSummary,
      teleopSummary: entry.teleopSummary,
      climbCapability: entry.climbCapability,
      expectedRole: entry.expectedRole,
      notes: entry.notes
    });
    setPitStatusMessage({ type: 'info', text: 'Editing pit entry.' });
  };

  const deletePitEntry = (id: string) => {
    setPitEntries((prev) => prev.filter((entry) => entry.id !== id));
    if (editingPitId === id) {
      resetPitForm();
    }
    setPitStatusMessage({ type: 'info', text: 'Pit entry deleted.' });
  };

  const handleUploadPending = async () => {
    if (!uploadUrl) {
      setStatusMessage({ type: 'error', text: 'Missing VITE_GOOGLE_SCRIPT_URL in your environment.' });
      return;
    }
    if (pendingEntries.length === 0) {
      setStatusMessage({ type: 'error', text: 'No pending entries to upload.' });
      return;
    }

    setUploading(true);
    setStatusMessage({ type: 'info', text: 'Uploading pending entries...' });

    try {
      await uploadEntries({
        uploadUrl,
        uploadSecret,
        scoutName,
        pendingEntries
      });

      const uploadedAt = new Date().toISOString();
      setEntries((prev) => prev.map((entry) => (entry.uploadedAt ? entry : { ...entry, uploadedAt })));
      setStatusMessage({
        type: 'success',
        text: `Uploaded ${pendingEntries.length} entr${pendingEntries.length === 1 ? 'y' : 'ies'} successfully.`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed.';
      setStatusMessage({ type: 'error', text: errorMessage });
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-app-bg text-[var(--txt)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:py-10">
        <SidebarNav
          activePage={activePage}
          setActivePage={setActivePage}
          pendingCount={pendingEntries.length}
          totalCount={entries.length}
          pitCount={pitEntries.length}
          scoutName={scoutName}
          setScoutName={setScoutName}
        />

        <div className="flex-1 space-y-6">
          {activePage === 'entry' ? (
            <ScoutingPage
              editingId={editingId}
              form={form}
              updateForm={updateForm}
              onSave={handleSave}
              onCancelEdit={() => {
                resetForm(scoutName);
                setStatusMessage({ type: 'info', text: 'Edit cancelled.' });
              }}
            />
          ) : activePage === 'entries' ? (
            <EntriesPage
              entries={entries}
              pitEntries={pitEntries}
              pendingCount={pendingEntries.length}
              uploading={uploading}
              uploadUrl={uploadUrl ?? ''}
              onUploadPending={handleUploadPending}
              onEditEntry={startEdit}
              onDeleteEntry={deleteEntry}
              onEditPitEntry={editPitEntry}
              onDeletePitEntry={deletePitEntry}
            />
          ) : (
            <PitScoutingPage
              pitEntries={pitEntries}
              pitForm={pitForm}
              editingPitId={editingPitId}
              updatePitForm={updatePitForm}
              onSavePitEntry={handleSavePitEntry}
              onEditPitEntry={editPitEntry}
              onDeletePitEntry={deletePitEntry}
              onCancelPitEdit={() => {
                resetPitForm();
                setPitStatusMessage({ type: 'info', text: 'Pit edit cancelled.' });
              }}
            />
          )}
        </div>
      </div>
      <AppToaster />
    </main>
  );
}

export default App;