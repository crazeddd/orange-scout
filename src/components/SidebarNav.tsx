import { ClipboardPen, LayoutList, Wrench } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { ActivePage } from '../model/types';
import logo from "/nav-logo512.png";

type SidebarNavProps = {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  pendingCount: number;
  totalCount: number;
  scoutName: string;
  setScoutName: (value: string) => void;
};

export function SidebarNav({
  activePage,
  setActivePage,
  pendingCount,
  totalCount,
  scoutName,
  setScoutName
}: SidebarNavProps) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="gap-1 px-4 py-3">
        <img src={logo} alt="Logo" className="size-6" />
        <h1 className="text-lg font-black leading-tight">Orange Scout</h1>
        <p className="text-xs text-sidebar-foreground/70">All data saved locally until uploaded.</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Scout</SidebarGroupLabel>
          <div className="px-2 pb-2 pt-1 space-y-2">
            <Label htmlFor="globalScoutName" className="text-xs text-sidebar-foreground/70">
              Scout Name
            </Label>
            <SidebarInput
              id="globalScoutName"
              value={scoutName}
              onChange={(event) => setScoutName(event.target.value)}
              placeholder="Used for all scouting forms"
            />
          </div>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activePage === 'entry'}
                onClick={() => setActivePage('entry')}
                tooltip="Scouting"
              >
                <ClipboardPen className="size-4" />
                <span>Scouting</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activePage === 'pit'}
                onClick={() => setActivePage('pit')}
                tooltip="Pit Scouting"
              >
                <Wrench className="size-4" />
                <span>Pit Scouting</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activePage === 'entries'}
                onClick={() => setActivePage('entries')}
                tooltip="View Entries"
              >
                <LayoutList className="size-4" />
                <span>View Entries</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="mx-2 rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3 text-xs text-sidebar-foreground/70">
          Pending: <span className="text-sidebar-foreground">{pendingCount}</span>
          <br />
          Total: <span className="text-sidebar-foreground">{totalCount}</span>
          <br />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}