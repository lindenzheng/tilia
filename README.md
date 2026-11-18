# Tilia

A Firefox-first tab manager with a treelike hierarchical sidebar. This initial scaffold implements **Phase 1**: a live tab list, tab activation, closing, creating, native pinning, mute toggling, search, and browser-event synchronization.

## Requirements

- Node.js 20.17+ or a compatible current LTS
- npm
- Firefox 128+

## Install and run

```bash
npm install
npm run build
npm run firefox
```

`npm run firefox` builds the extension and launches Firefox with the unpacked extension using `web-ext`. Alternatively, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on…**, and select `dist/manifest.json`.

For UI development:

```bash
npm run dev
```

Vite serves the sidebar page for visual work, but Firefox extension APIs are only available when the built extension is loaded in Firefox.

## Phase 1 functionality

- Lists tabs in the current window; toggle **This window / All windows**.
- Activates a tab when its row is clicked.
- Closes tabs, creates tabs, and toggles Firefox-native pinning.
- Mutes/unmutes tabs when they are audible.
- Searches tab titles and URLs.
- Receives background tab events and refreshes from Firefox's canonical tab list.
- Displays native Firefox pinned tabs in a separate top section.

## Current limitations

The tree UI is intentionally a flat list in Phase 1. Groups, opener-based nesting, extension-level stars/pins, and persistent tree metadata are Phase 2/3 work. The search shortcut hint is decorative for now. The project is Firefox-specific because it uses `sidebar_action` and `browser.sidebarAction`.

## Architecture notes

- `src/background/index.ts` registers top-level event listeners and relays tab changes.
- `src/sidebar/` contains the React sidebar.
- `src/shared/types.ts` defines the message and tab shapes shared between contexts.
- The sidebar re-queries `browser.tabs` after events rather than trusting partial event payloads; this avoids stale state when tabs move between windows.

## Permissions

- `tabs`: read tab titles, URLs, favicons, and control tabs.
- `storage`: reserved for upcoming persistent tree and preference state.
