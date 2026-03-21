import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
              value={String(form.matchNumber)}
              onChange={(event) => updateForm('matchNumber', parseNumberInput(event.target.value, 1))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teamNumber">Team Number</Label>
            <Input
              id="teamNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={String(form.teamNumber)}
              onChange={(event) => updateForm('teamNumber', parseNumberInput(event.target.value, 1))}
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
                <SelectItem value="trench">Trench (left)</SelectItem>
                <SelectItem value="fender">Trench (right)</SelectItem>
                <SelectItem value="bump">Bump (left)</SelectItem>
                <SelectItem value="other">Bump (right)</SelectItem>

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
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <fieldset className="rounded-lg border border-[var(--border)] p-4">
            <legend className="px-1 text-sm font-semibold text-[var(--txt)]">Auton</legend>
            <div className="space-y-3">
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
            <legend className="px-1 text-sm font-semibold text-[var(--txt)]">Teleop</legend>
            <div className="space-y-3">
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
              <div className="flex items-center gap-2">
                <Checkbox
                  id="playedDefense"
                  checked={form.playedDefense}
                  onCheckedChange={(checked) => updateForm('playedDefense', checked === true)}
                />
                <Label htmlFor="playedDefense" className="text-sm text-[var(--txt-light)]">
                  Played Defense?
                </Label>
              </div>
            </div>
          </fieldset>
        </div>

        <fieldset className="rounded-lg border border-[var(--border)] p-4">
          <legend className="px-1 text-sm font-semibold text-[var(--txt)]">Overall</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teamPointsPercentage">% of Team Points Scored</Label>
              <div className="space-y-2">
                <Slider
                  id="teamPointsPercentage"
                  min={0}
                  max={100}
                  step={5}
                  value={[form.teamPointsPercentage]}
                  onValueChange={(value) => updateForm('teamPointsPercentage', value[0] ?? 0)}
                />
                <div className="text-xs text-[var(--txt-light)]">{form.teamPointsPercentage}%</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accuracyPercentage">Accuracy Percentage</Label>
              <div className="space-y-2">
                <Slider
                  id="accuracyPercentage"
                  min={0}
                  max={100}
                  step={5}
                  value={[form.accuracyPercentage]}
                  onValueChange={(value) => updateForm('accuracyPercentage', value[0] ?? 0)}
                />
                <div className="text-xs text-[var(--txt-light)]">{form.accuracyPercentage}%</div>
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