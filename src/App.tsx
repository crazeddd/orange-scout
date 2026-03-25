import { useEffect, useMemo, useState } from 'react';
import { EntriesPage } from './pages/EntriesPage';
import { ScoutingPage } from './pages/ScoutingPage';
import { PitScoutingPage } from './pages/PitScoutingPage';
import { SidebarNav } from './components/SidebarNav';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
  const [entries, setEntries] = useState<ScoutEntry[]>(() => parseStoredEntries());
  const [pitEntries, setPitEntries] = useState<PitEntry[]>(() => parseStoredPitEntries());
  const [scoutName, setScoutName] = useState(() => localStorage.getItem(SCOUT_NAME_KEY) ?? '');
  const [form, setForm] = useState<ScoutFormData>(emptyForm(''));
  const [pitForm, setPitForm] = useState<PitFormData>(emptyPitForm(''));
  const [activePage, setActivePage] = useState<ActivePage>('entry');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPitId, setEditingPitId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<AppMessage | null>(null);
  const [pitStatusMessage, setPitStatusMessage] = useState<AppMessage | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const uploadUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

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

  const notify = (message: AppMessage) => {
    if (message.type === 'success') {
      toast.success(message.text);
      return;
    }
    if (message.type === 'error') {
      toast.error(message.text);
      return;
    }
    toast.info(message.text);
  };

  useEffect(() => {
    if (!statusMessage) return;
    notify(statusMessage);
  }, [statusMessage]);

  useEffect(() => {
    if (!pitStatusMessage) return;
    notify(pitStatusMessage);
  }, [pitStatusMessage]);

  const pendingEntries = useMemo(() => entries.filter((entry) => !entry.uploadedAt), [entries]);

  const pendingPitEntries = useMemo(() => pitEntries.filter((entry) => !entry.uploadedAt), [pitEntries]);

  const totalPendingCount = useMemo(() => pendingEntries.length + pendingPitEntries.length, [pendingEntries, pendingPitEntries]);

  useEffect(() => {
    const isStandalone = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      if (!isStandalone()) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setShowInstallPrompt(false);
    };

    const handleUpdateAvailable = () => {
      setShowUpdatePrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-update-available', handleUpdateAvailable as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable as EventListener);
    };
  }, []);

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
      autonClimbLevel: entry.autonClimbLevel,
      teleopClimbLevel: entry.teleopClimbLevel,
      playedDefense: entry.playedDefense,
      disconnected: entry.disconnected ?? false,
      noShow: entry.noShow ?? false,
      estimatedAutoFuelScored: entry.estimatedAutoFuelScored ?? 0,
      estimatedTeleopFuelScored: entry.estimatedTeleopFuelScored ?? 0,
      shootingAccuracy: entry.shootingAccuracy ?? 0,
      passedFuel: entry.passedFuel ?? false,
      passedFuelAmount: entry.passedFuelAmount ?? 0,
      usedCorral: entry.usedCorral ?? false,
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
      gearRatio: entry.gearRatio ?? '',
      fuelCapacity: entry.fuelCapacity ?? 0,
      autonomousSummary: entry.autonomousSummary,
      teleopSummary: entry.teleopSummary,
      climbCapability: entry.climbCapability,
      canGoUnderTrench: entry.canGoUnderTrench ?? false,
      canGoOverBump: entry.canGoOverBump ?? false,
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

  const deleteAllEntries = () => {
    setEntries([]);
    setPitEntries([]);
    resetForm(scoutName);
    resetPitForm();
    setStatusMessage({ type: 'info', text: 'All saved entries deleted.' });
  };

  const handleUploadPending = async () => {
    if (!uploadUrl) {
      setStatusMessage({ type: 'error', text: 'Missing VITE_GOOGLE_SCRIPT_URL in your environment.' });
      return;
    }
    if (totalPendingCount === 0) {
      setStatusMessage({ type: 'error', text: 'No pending entries to upload.' });
      return;
    }

    setUploading(true);
    setStatusMessage({ type: 'info', text: 'Uploading pending entries...' });

    try {
      await uploadEntries({
        uploadUrl,
        scoutName,
        pendingEntries,
        pendingPitEntries
      });

      setEntries((prev) => prev.filter((entry) => entry.uploadedAt));
      setPitEntries((prev) => prev.filter((entry) => entry.uploadedAt));
      setStatusMessage({
        type: 'success',
        text: `Uploaded and removed ${totalPendingCount} entr${totalPendingCount === 1 ? 'y' : 'ies'}.`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed.';
      setStatusMessage({ type: 'error', text: errorMessage });
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-svh bg-app-bg text-foreground">
      <SidebarProvider>
        <SidebarNav
          activePage={activePage}
          setActivePage={setActivePage}
          pendingCount={totalPendingCount}
          totalCount={entries.length + pitEntries.length}
          scoutName={scoutName}
          setScoutName={setScoutName}
        />
        <SidebarInset>
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-light)]/60 px-4 py-3 md:hidden">
            <SidebarTrigger />
            <span className="text-sm font-semibold">Orange Scout</span>
          </div>
          <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-6 lg:py-10">
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
                pendingCount={totalPendingCount}
                uploading={uploading}
                uploadUrl={uploadUrl ?? ''}
                onUploadPending={handleUploadPending}
                onEditEntry={startEdit}
                onDeleteEntry={deleteEntry}
                onEditPitEntry={editPitEntry}
                onDeletePitEntry={deletePitEntry}
                onDeleteAllEntries={deleteAllEntries}
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
        </SidebarInset>
      </SidebarProvider>
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install Orange Scout</DialogTitle>
            <DialogDescription>
              Install the app for faster access and offline use during events.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowInstallPrompt(false)}>
              Not Now
            </Button>
            <Button
              onClick={async () => {
                if (!installPrompt) return;
                await installPrompt.prompt();
                await installPrompt.userChoice;
                setShowInstallPrompt(false);
              }}
              disabled={!installPrompt}
            >
              Install App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showUpdatePrompt} onOpenChange={setShowUpdatePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Available</DialogTitle>
            <DialogDescription>
              A new version is ready. Reload to get the latest changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowUpdatePrompt(false)}>
              Later
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </main>
  );
}

export default App;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};