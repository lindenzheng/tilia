export interface BrowserTab {
  id: number; windowId: number; index: number; title: string; url?: string; favIconUrl?: string;
  active: boolean; pinned: boolean; audible?: boolean; mutedInfo?: { muted: boolean };
  status?: string; openerTabId?: number;
}
export interface TreeNode {
  id: string;
  kind: 'group' | 'tab';
  title?: string;
  tabId?: number;
  parentId: string | null;
  children: string[];
  collapsed?: boolean;
  order: number;
}
export interface WindowTree { windowId: number; rootIds: string[]; nodes: Record<string, TreeNode>; }
export interface PersistedState { windows: Record<string, WindowTree>; }
export type TabEventMessage = { type: string; [key: string]: unknown };
