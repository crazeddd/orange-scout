import { Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PitEntry, PitFormData } from '../model/types';
import { parseNumberInput } from '../model/utils';

type PitScoutingPageProps = {
  pitEntries: PitEntry[];
  pitForm: PitFormData;
  editingPitId: string | null;
  updatePitForm: <K extends keyof PitFormData>(key: K, value: PitFormData[K]) => void;
  onSavePitEntry: () => void;
  onEditPitEntry: (entry: PitEntry) => void;
  onDeletePitEntry: (id: string) => void;
  onCancelPitEdit: () => void;
};

export function PitScoutingPage({
  pitEntries,
  pitForm,
  editingPitId,
  updatePitForm,
  onSavePitEntry,
  onEditPitEntry,
  onDeletePitEntry,
  onCancelPitEdit
}: PitScoutingPageProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{editingPitId ? 'Edit Pit Entry' : 'Pit Scouting'}</CardTitle>
          <CardDescription>Yeah.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pitTeamNumber">Team Number</Label>
              <Input
                id="pitTeamNumber"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={String(pitForm.teamNumber)}
                onChange={(event) => updatePitForm('teamNumber', parseNumberInput(event.target.value, 1))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pitDrivetrain">Drivetrain</Label>
              <Select
                value={pitForm.drivetrain}
                onValueChange={(value) => updatePitForm('drivetrain', value as PitFormData['drivetrain'])}
              >
                <SelectTrigger id="pitDrivetrain">
                  <SelectValue placeholder="Select drivetrain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swerve">Swerve</SelectItem>
                  <SelectItem value="tank">Tank</SelectItem>
                  <SelectItem value="mecanum">Mecanum</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pitFuelCapacity">Fuel Capacity</Label>
              <Input
                id="pitFuelCapacity"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={String(pitForm.fuelCapacity)}
                onChange={(event) => updatePitForm('fuelCapacity', parseNumberInput(event.target.value, 0))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pitClimbCapability">Climb Capability</Label>
              <Select
                value={pitForm.climbCapability}
                onValueChange={(value) => updatePitForm('climbCapability', value as PitFormData['climbCapability'])}
              >
                <SelectTrigger id="pitClimbCapability">
                  <SelectValue placeholder="Select climb" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="L1">L1</SelectItem>
                  <SelectItem value="L2">L2</SelectItem>
                  <SelectItem value="L3">L3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label htmlFor="canGoUnderTrench">Can go under trench</Label>
              </div>
              <Switch
                id="canGoUnderTrench"
                checked={pitForm.canGoUnderTrench}
                onCheckedChange={(checked) => updatePitForm('canGoUnderTrench', checked === true)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label htmlFor="canGoOverBump">Can go over bump</Label>
              </div>
              <Switch
                id="canGoOverBump"
                checked={pitForm.canGoOverBump}
                onCheckedChange={(checked) => updatePitForm('canGoOverBump', checked === true)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pitAuto">Autonomous Summary</Label>
            <Textarea
              id="pitAuto"
              value={pitForm.autonomousSummary}
              placeholder="Auto paths, scoring focus, consistency..."
              onChange={(event) => updatePitForm('autonomousSummary', event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pitTeleop">Teleop Summary</Label>
            <Textarea
              id="pitTeleop"
              value={pitForm.teleopSummary}
              placeholder="Cycle speed, intake details, scoring priorities..."
              onChange={(event) => updatePitForm('teleopSummary', event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pitNotes">Notes</Label>
            <Textarea
              id="pitNotes"
              value={pitForm.notes}
              placeholder="Anything else useful from the pit conversation..."
              onChange={(event) => updatePitForm('notes', event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onSavePitEntry} className="gap-2">
              {editingPitId ? <Save size={16} /> : <Plus size={16} />} {editingPitId ? 'Update Pit Entry' : 'Save Pit Entry'}
            </Button>
            {editingPitId && (
              <Button variant="secondary" onClick={onCancelPitEdit}>
                Cancel Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
