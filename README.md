# tilia
A Firefox extension for treelike tab management.

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
