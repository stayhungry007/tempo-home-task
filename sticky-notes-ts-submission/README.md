# Sticky Notes (TypeScript + React)

A single-page sticky notes application built with React and TypeScript as a small home-task project.

Features implemented
- Create notes (double-click board or Create Note) with chosen size and color.
- Move notes by dragging their header.
- Resize notes by dragging the bottom-right handle.
- Delete notes by dragging them over the Trash area.
- Edit note content (contentEditable) and edit note title (double-click header).
- Z-order management (click/interaction brings a note to front).
- Notes persist to localStorage and can be saved/loaded via an asynchronous mock REST API.
- Per-note color palette and preset swatches.

Bonus/Extra
- Asynchronous mock server (src/api/mockApi.ts) used by Save/Load UI.
- Tests included for core utilities and behaviors (see Tests section).
- UI split into smaller components (Sidebar, NoteHeader, NoteContent, NoteResizer, HelpModal).

Quick start
1. Install dependencies

   npm install

2. Run in development

   npm start

3. Build for production

   npm run build

Tests
- Run interactive tests: npm test
- CI mode (single run): npm run test:ci
- Coverage report: npm run coverage

Files of interest
- src/App.tsx — app shell, state and orchestration
- src/components/* — UI components (Note, Sidebar, Trash, HelpModal, etc.)
- src/utils/size.ts — size parsing & clamping helper (tested)
- src/api/mockApi.ts — asynchronous mock REST API (simulated latency)
- src/__tests__ — unit and integration tests

Architecture summary
The app keeps a central list of notes in App.tsx (serializable NoteData objects). UI components are small and focused: Note handles pointer interactions (move/resize) and reports changes to the app via callbacks; Sidebar manages creation, size/color controls and triggers Save/Load. The mock API provides asynchronous persistence for integration testing and demonstrates how the app would integrate with a real backend.

Notes & known limitations
- This implementation targets desktop browsers (Chrome/Firefox/Edge) and assumes a minimum resolution of 1024×768.
- The mock API stores server data in localStorage for simplicity.
- Accessibility and keyboard controls are partially implemented; further work is recommended for full keyboard interactions and ARIA improvements.

If you need the app packaged, dockerized, or tested on CI, tell me which configuration to add and I will provide it.
