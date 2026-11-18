export interface BrowserTab {
  id: number;
  windowId: number;
  index: number;
  title: string;
  url?: string;
  favIconUrl?: string;
  active: boolean;
  pinned: boolean;
  audible?: boolean;
  mutedInfo?: { muted: boolean };
  status?: string;
  openerTabId?: number;
}

export type TabEventMessage =
  | { type: 'TAB_CREATED'; tab: BrowserTab }
  | { type: 'TAB_UPDATED'; tabId: number; changeInfo: Record<string, unknown>; tab: BrowserTab }
  | { type: 'TAB_REMOVED'; tabId: number; windowId: number }
  | { type: 'TAB_ACTIVATED'; tabId: number; windowId: number }
  | { type: 'TAB_MOVED'; tabId: number; windowId: number; toIndex: number }
  | { type: 'TAB_ATTACHED'; tabId: number; newWindowId: number; newPosition: number }
  | { type: 'TAB_DETACHED'; tabId: number; oldWindowId: number };
