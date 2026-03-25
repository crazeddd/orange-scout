import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScoutFormData } from '../model/types';
import { parseNumberInput } from '../model/utils';

type ScoutingPageProps = {
  editingId: string | null;
  form: ScoutFormData;
  updateForm: <K extends keyof ScoutFormData>(key: K, value: ScoutFormData[K]) => void;
  onSave: () => void;
  onCancelEdit: () => void;
};

export function ScoutingPage({
  editingId,
  form,
  updateForm,
  onSave,
  onCancelEdit
}: ScoutingPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? 'Edit Scouting Entry' : 'Add Scouting Entry'}</CardTitle>
        <CardDescription>Yeah.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="matchNumber">Match Number</Label>
            <Input
              id="matchNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="1"
              value={form.matchNumber > 0 ? String(form.matchNumber) : ''}
              onChange={(event) => {
                const value = event.target.value;
                updateForm('matchNumber', value ? parseNumberInput(value, 1) : 0);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teamNumber">Team Number</Label>
            <Input
              id="teamNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="2583"
              value={form.teamNumber > 0 ? String(form.teamNumber) : ''}
              onChange={(event) => {
                const value = event.target.value;
                updateForm('teamNumber', value ? parseNumberInput(value, 1) : 0);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startingPosition">Starting Position (field orientated)</Label>
            <Select
              value={form.startingPosition}
              onValueChange={(value) => updateForm('startingPosition', value as ScoutFormData['startingPosition'])}
            >
              <SelectTrigger id="startingPosition">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hub">Hub</SelectItem>
                <SelectItem value="trench (left)">Trench (left)</SelectItem>
                <SelectItem value="trench (right)">Trench (right)</SelectItem>
                <SelectItem value="bump (left)">Bump (left)</SelectItem>
                <SelectItem value="bump (right)">Bump (right)</SelectItem>

              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alliance">Alliance</Label>
            <Select
              value={form.alliance}
              onValueChange={(value) => updateForm('alliance', value as ScoutFormData['alliance'])}
            >
              <SelectTrigger id="alliance">
                <SelectValue placeholder="Select alliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="disconnected"
              checked={form.disconnected}
              onCheckedChange={(checked) => updateForm('disconnected', checked === true)}
            />
            <Label htmlFor="disconnected" className="text-sm">
              Disconnected?
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="noShow"
              checked={form.noShow}
              onCheckedChange={(checked) => updateForm('noShow', checked === true)}
            />
            <Label htmlFor="noShow" className="text-sm">
              No Show?
            </Label>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <fieldset className="rounded-lg border p-4">
            <legend className="px-1 text-sm font-semibold">Auton</legend>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="estimatedAutoFuelScored">Estimated Auto Fuel Scored</Label>
                <Input
                  id="estimatedAutoFuelScored"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(form.estimatedAutoFuelScored)}
                  onChange={(event) => updateForm('estimatedAutoFuelScored', parseNumberInput(event.target.value, 0))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="autonClimbLevel">Climb Level</Label>
                <Select
                  value={form.autonClimbLevel}
                  onValueChange={(value) => updateForm('autonClimbLevel', value as ScoutFormData['autonClimbLevel'])}
                >
                  <SelectTrigger id="autonClimbLevel">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Climb</SelectItem>
                    <SelectItem value="failed">Failed Climb</SelectItem>
                    <SelectItem value="L1">L1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-[var(--border)] p-4">
            <legend className="px-1 text-sm font-semibold">Teleop</legend>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="estimatedTeleopFuelScored">Estimated Teleop Fuel Scored</Label>
                <Input
                  id="estimatedTeleopFuelScored"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(form.estimatedTeleopFuelScored)}
                  onChange={(event) => updateForm('estimatedTeleopFuelScored', parseNumberInput(event.target.value, 0))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teleopClimbLevel">Climb Level</Label>
                <Select
                  value={form.teleopClimbLevel}
                  onValueChange={(value) => updateForm('teleopClimbLevel', value as ScoutFormData['teleopClimbLevel'])}
                >
                  <SelectTrigger id="teleopClimbLevel">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Climb</SelectItem>
                    <SelectItem value="failed">Failed Climb</SelectItem>
                    <SelectItem value="L1">L1</SelectItem>
                    <SelectItem value="L2">L2</SelectItem>
                    <SelectItem value="L3">L3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="passedFuel"
                    checked={form.passedFuel}
                    onCheckedChange={(checked) => {
                      const enabled = checked === true;
                      updateForm('passedFuel', enabled);
                      if (!enabled) {
                        updateForm('passedFuelAmount', 0);
                      }
                    }}
                  />
                  <Label htmlFor="passedFuel" className="text-sm text-muted-foreground">
                    Passed Fuel?
                  </Label>
                </div>
              </div>
              {form.passedFuel && (
                <div className="space-y-2">
                  <Label htmlFor="passedFuelAmount">Amount Passed</Label>
                  <Input
                    id="passedFuelAmount"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={String(form.passedFuelAmount)}
                    onChange={(event) => updateForm('passedFuelAmount', parseNumberInput(event.target.value, 0))}
                    placeholder="0"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="playedDefense"
                  checked={form.playedDefense}
                  onCheckedChange={(checked) => updateForm('playedDefense', checked === true)}
                />
                <Label htmlFor="playedDefense" className="text-sm text-muted-foreground">
                  Played Defense?
                </Label>
              </div>
            </div>
          </fieldset>
        </div>

        <fieldset className="rounded-lg border border-[var(--border)] p-4">
          <legend className="px-1 text-sm font-semibold">Overall</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="usedCorral"
                  checked={form.usedCorral}
                  onCheckedChange={(checked) => updateForm('usedCorral', checked === true)}
                />
                <Label htmlFor="usedCorral" className="text-sm text-muted-foreground">
                  Used Corral?
                </Label>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                placeholder="Driver consistency, strategy notes, endgame reliability..."
                onChange={(event) => updateForm('notes', event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <Button onClick={onSave} className="gap-2">
            {editingId ? <Save size={16} /> : <Plus size={16} />} {editingId ? 'Update Entry' : 'Save Entry'}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={onCancelEdit}>
              Cancel Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}