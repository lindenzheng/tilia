import type { BrowserTab, TabEventMessage } from '../shared/types';

// Keep listeners at module scope: Firefox MV3 background scripts are event-driven.
function publish(message: TabEventMessage) {
  void browser.runtime.sendMessage(message).catch(() => {
    // No sidebar may be open. The next sidebar load performs a fresh tabs.query().
  });
}

browser.tabs.onCreated.addListener((tab) => {
  if (tab.id === undefined || tab.windowId === undefined) return;
  publish({ type: 'TAB_CREATED', tab: tab as unknown as BrowserTab });
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  publish({ type: 'TAB_UPDATED', tabId, changeInfo: changeInfo as unknown as Record<string, unknown>, tab: tab as unknown as BrowserTab });
});

browser.tabs.onRemoved.addListener((tabId, info) => {
  publish({ type: 'TAB_REMOVED', tabId, windowId: info.windowId });
});

browser.tabs.onActivated.addListener((info) => {
  publish({ type: 'TAB_ACTIVATED', tabId: info.tabId, windowId: info.windowId });
});

browser.tabs.onMoved.addListener((tabId, info) => {
  publish({ type: 'TAB_MOVED', tabId, windowId: info.windowId, toIndex: info.toIndex });
});

browser.tabs.onAttached.addListener((tabId, info) => {
  publish({ type: 'TAB_ATTACHED', tabId, newWindowId: info.newWindowId, newPosition: info.newPosition });
});

browser.tabs.onDetached.addListener((tabId, info) => {
  publish({ type: 'TAB_DETACHED', tabId, oldWindowId: info.oldWindowId });
});

browser.action.onClicked.addListener(() => {
  void browser.sidebarAction.open();
});
