import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Plus, ChevronDown, ChevronRight, Globe, Volume2, VolumeX, Pin, Star, MoreHorizontal, Layers3 } from 'lucide-react';
import type { BrowserTab, TabEventMessage } from '../shared/types';

type TabNode = BrowserTab;

function getDomain(url?: string) {
  if (!url) return 'New tab';
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

function TabIcon({ tab }: { tab: BrowserTab }) {
  if (tab.favIconUrl && !tab.favIconUrl.startsWith('chrome:')) {
    return <img className="favicon" src={tab.favIconUrl} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
  }
  return <Globe size={15} className="fallback-icon" />;
}

export default function App() {
  const [tabs, setTabs] = useState<TabNode[]>([]);
  const [query, setQuery] = useState('');
  const [currentWindowId, setCurrentWindowId] = useState<number | null>(null);
  const [showAllWindows, setShowAllWindows] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [currentWindow, allTabs] = await Promise.all([
        browser.windows.getCurrent(),
        browser.tabs.query({})
      ]);
      setCurrentWindowId(currentWindow.id ?? null);
      setTabs(allTabs.filter((tab) => tab.id !== undefined && tab.windowId !== undefined) as unknown as TabNode[]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to read browser tabs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    void refresh();
    const listener = (message: TabEventMessage | unknown) => {
      if (!message || typeof message !== 'object' || !('type' in message)) return;
      // Re-query for a canonical snapshot. This also handles tabs moving between windows.
      void refresh();
    };
    browser.runtime.onMessage.addListener(listener);
    return () => {
      browser.runtime.onMessage.removeListener(listener);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [refresh]);

  const visibleTabs = useMemo(() => {
    const scoped = showAllWindows ? tabs : tabs.filter((tab) => tab.windowId === currentWindowId);
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return scoped
      .filter((tab) => !tab.pinned)
      .filter((tab) => !normalizedQuery || `${tab.title} ${tab.url ?? ''}`.toLocaleLowerCase().includes(normalizedQuery))
      .sort((a, b) => a.windowId - b.windowId || a.index - b.index);
  }, [tabs, currentWindowId, query, showAllWindows]);

  const pinnedTabs = useMemo(() => {
    const scoped = showAllWindows ? tabs : tabs.filter((tab) => tab.windowId === currentWindowId);
    return scoped.filter((tab) => tab.pinned).sort((a, b) => a.windowId - b.windowId || a.index - b.index);
  }, [tabs, currentWindowId, showAllWindows]);

  const activateTab = async (tab: BrowserTab) => {
    try {
      await browser.tabs.update(tab.id, { active: true });
      if (tab.windowId !== currentWindowId) await browser.windows.update(tab.windowId, { focused: true });
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not activate tab.'); }
  };

  const closeTab = async (tabId: number) => {
    try { await browser.tabs.remove(tabId); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not close tab.'); }
  };

  const createTab = async () => {
    try { await browser.tabs.create({}); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not create tab.'); }
  };

  const toggleMute = async (tab: BrowserTab) => {
    try { await browser.tabs.update(tab.id, { muted: !tab.mutedInfo?.muted }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not change mute state.'); }
  };

  const togglePin = async (tab: BrowserTab) => {
    try { await browser.tabs.update(tab.id, { pinned: !tab.pinned }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not pin tab.'); }
  };

  const renderTab = (tab: BrowserTab) => (
    <div className={`tab-row ${tab.active ? 'active' : ''}`} key={tab.id}>
      <button className="tab-main" onClick={() => void activateTab(tab)} title={`${tab.title}\n${tab.url ?? ''}`}>
        <TabIcon tab={tab} />
        <span className="tab-copy">
          <span className="tab-title">{tab.title || getDomain(tab.url)}</span>
          <span className="tab-domain">{getDomain(tab.url)}</span>
        </span>
        {tab.audible && <Volume2 size={13} className="audio-indicator" />}
      </button>
      <div className="tab-actions">
        {tab.audible && <button className="icon-button" title={tab.mutedInfo?.muted ? 'Unmute tab' : 'Mute tab'} onClick={() => void toggleMute(tab)}>{tab.mutedInfo?.muted ? <VolumeX size={14}/> : <Volume2 size={14}/>}</button>}
        <button className="icon-button" title={tab.pinned ? 'Unpin tab' : 'Pin tab'} onClick={() => void togglePin(tab)}><Pin size={13}/></button>
        <button className="icon-button close-button" title="Close tab" onClick={() => void closeTab(tab.id)}><X size={14}/></button>
      </div>
    </div>
  );

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-row">
          <div className="brand-mark"><Layers3 size={17}/></div>
          <div className="brand-text"><strong>Tilia</strong><span>{visibleTabs.length + pinnedTabs.length} tabs in view</span></div>
          <button className="header-action" onClick={() => void createTab()} title="New tab"><Plus size={17}/></button>
          <button className="header-action" onClick={() => void refresh()} title="Refresh tabs"><MoreHorizontal size={18}/></button>
        </div>
        <label className="search-box">
          <Search size={15}/>
          <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tabs…" aria-label="Search tabs" />
          {query && <button className="clear-search" onClick={() => setQuery('')} title="Clear search"><X size={13}/></button>}
          <kbd>⌘ K</kbd>
        </label>
        <div className="scope-row">
          <span className="section-eyebrow">WORKSPACE</span>
          <button className={`scope-toggle ${showAllWindows ? 'selected' : ''}`} onClick={() => setShowAllWindows((value) => !value)}>
            {showAllWindows ? 'All windows' : 'This window'} <ChevronDown size={13}/>
          </button>
        </div>
      </header>

      {error && <div className="error-banner" role="alert">{error}</div>}
      <section className="tab-content">
        {pinnedTabs.length > 0 && (
          <div className="tab-section">
            <div className="section-heading"><span className="section-eyebrow"><Pin size={11}/> PINNED</span><span className="count-pill">{pinnedTabs.length}</span></div>
            {pinnedTabs.map(renderTab)}
          </div>
        )}
        <div className="tab-section tree-section">
          <div className="section-heading"><span className="section-eyebrow"><Layers3 size={11}/> ALL TABS</span><span className="count-pill">{visibleTabs.length}</span></div>
          {loading ? <div className="empty-state">Loading tabs…</div> : visibleTabs.length === 0 ? (
            <div className="empty-state">{query ? 'No tabs match your search.' : 'No open tabs.'}</div>
          ) : (
            <div className="tree-list">
              {visibleTabs.map((tab) => <div className="tree-node" key={tab.id}>{renderTab(tab)}</div>)}
            </div>
          )}
        </div>
      </section>
      <footer className="app-footer"><span><span className="status-dot"/> Live browser sync</span><span>PHASE 1 · TAB LIST</span></footer>
    </main>
  );
}
