import { ClipboardPen, LayoutList, Wrench } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ActivePage } from '../model/types';

type SidebarNavProps = {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  pendingCount: number;
  totalCount: number;
  pitCount: number;
  scoutName: string;
  setScoutName: (value: string) => void;
};

export function SidebarNav({
  activePage,
  setActivePage,
  pendingCount,
  totalCount,
  pitCount,
  scoutName,
  setScoutName
}: SidebarNavProps) {
  return (
    <aside className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--acc-s)_75%,black)] p-4 shadow-xl backdrop-blur lg:sticky lg:top-8 lg:h-fit lg:w-72">
      {/* <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--acc-p)]">FRC Scouting App</p> */}
      <h1 className="mt-2 text-2xl font-black leading-tight">Orange Scout</h1>
      <p className="mt-2 text-sm text-[var(--txt-light)]">All data saved locally until uploaded.</p>

      <div className="mt-4 space-y-2">
        <Label htmlFor="globalScoutName">Scout Name</Label>
        <Input
          id="globalScoutName"
          value={scoutName}
          onChange={(event) => setScoutName(event.target.value)}
          placeholder="Used for all scouting forms"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1">
        <Button
          variant={activePage === 'entry' ? 'default' : 'secondary'}
          onClick={() => setActivePage('entry')}
          className="justify-start gap-2"
        >
          <ClipboardPen size={16} /> Scouting
        </Button>
        <Button
          variant={activePage === 'pit' ? 'default' : 'secondary'}
          onClick={() => setActivePage('pit')}
          className="justify-start gap-2"
        >
          <Wrench size={16} /> Pit Scouting
        </Button>
        <Button
          variant={activePage === 'entries' ? 'default' : 'secondary'}
          onClick={() => setActivePage('entries')}
          className="justify-start gap-2"
        >
          <LayoutList size={16} /> View Entries
        </Button>
      </div>

      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--bg-light)] p-3 text-sm text-[var(--txt-light)]">
        Pending: <span className="font-semibold text-[var(--safe)]">{pendingCount}</span>
        <br />
        Total: <span className="font-semibold text-[var(--acc-p)]">{totalCount}</span>
        <br />
        Pit: <span className="font-semibold text-[var(--txt)]">{pitCount}</span>
      </div>
    </aside>
  );
}