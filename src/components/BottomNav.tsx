import { ClipboardPen, LayoutList, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivePage } from '../model/types';

type BottomNavProps = {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  pendingCount: number;
  totalCount: number;
  scoutName: string;
  setScoutName: (value: string) => void;
};

export function BottomNav({
  activePage,
  setActivePage
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background py-1 px-0">
      <div className="flex justify-around gap-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActivePage('entry')}
          className="flex flex-col items-center gap-1 h-auto py-1 px-3 !bg-transparent hover:!bg-transparent"
        >
          <ClipboardPen className="size-5" />
          <span className="text-xs">Scouting</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActivePage('pit')}
          className="flex flex-col items-center gap-1 h-auto py-1 px-3 !bg-transparent hover:!bg-transparent"
        >
          <Wrench className="size-5" />
          <span className="text-xs">Pit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActivePage('entries')}
          className="flex flex-col items-center gap-1 h-auto py-1 px-3 !bg-transparent hover:!bg-transparent"
        >
          <LayoutList className="size-5" />
          <span className="text-xs">Entries</span>
        </Button>
      </div>
    </nav>
  );
}
