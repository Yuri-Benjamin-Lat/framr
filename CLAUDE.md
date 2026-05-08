# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production bundle → /dist
npm run preview   # Serve built assets locally
npm run lint      # ESLint (flat config, jsx files)
```

No test suite is configured.

## Architecture

**Framr** is a browser-based photo booth app — a 4-step wizard that captures, customizes, and exports photo strips using only browser APIs (no backend).

### State & Data Flow

All application state lives in `App.jsx` as flat `useState` calls. There is no Context, Redux, or other state library. Data flows down via props; callbacks flow up. The wizard progresses through steps 1–4 via `goNext()` / `goBack()` / `restart()` helpers.

Key state: `step`, `format`, `photos` (data URLs), `filter`, `frameColor`, `isDark`.

### Step Components (`src/components/`)

| Step | Component | Responsibility |
|------|-----------|----------------|
| 1 | `ChooseFormat` | Select photo layout (calls `onSelect` + `onNext`) |
| 2 | `CameraStep` | Live capture via `useCamera` hook; countdown timer, flash effect |
| 3 | `CustomizeStep` | Filter/frame color pickers, drag-to-reorder, live `PrintPreview` |
| 4 | `SaveShareStep` | Triggers `compositePhoto()`, download PNG/JPEG, print, Web Share API |

`Sidebar` is a read-only step-progress indicator that adapts across breakpoints.

### Core Utilities

- **`src/hooks/useCamera.js`** — wraps `getUserMedia`, canvas snapshot, front/back flip, stream cleanup on unmount.
- **`src/utils/canvas.js`** — `compositePhoto(photos, format, filter, frameColor)` → PNG data URL. Applies CSS filters via canvas, handles layout-specific padding/gaps with `drawCover()` for aspect-ratio-aware scaling.
- **`src/data/formats.js`** — exports `FORMATS`, `FILTERS`, and `FRAME_COLORS` arrays. Format objects carry `photoCount` and `layout` enum used by both `CameraStep` (to know how many shots to take) and `canvas.js` (to know how to composite them).

### Responsive Layout

Three breakpoints, all via Tailwind:
- **Mobile** (`< md`): bottom tab bar navigation, bottom-sheet modals for controls.
- **Tablet** (`md–lg`): icon rail sidebar, side panels.
- **Desktop** (`lg+`): full sidebar, multi-column panels.

### Styling

- **Tailwind CSS 4** loaded via `@tailwindcss/vite` plugin — `@import "tailwindcss"` in `index.css`.
- Dark mode via `.dark` class on `<html>`, toggled with `classList.toggle()`. Persisted to `localStorage`.
- Accent color: `#8B3714` (burnt orange). Backgrounds: `#f5f0ea` light / `#191210` dark.
- Fonts: **DM Sans** (body) and **Playfair Display** (display/logo), both via Google Fonts in `index.html`.
- Custom keyframe animations for the splash screen are defined in `index.css`.

### JavaScript, Not TypeScript

The project uses `.jsx` files without TypeScript compilation. `@types` packages are installed for IDE autocomplete only — there is no `tsconfig.json` and no type-checking step.

## Working Rules

- Never run git commit or git push — the user handles all git operations
- After every change, suggest a commit message covering everything that was modified
- Never rewrite an entire file unless absolutely necessary — only edit the specific lines that changed
- Always state which file and line(s) you are editing before making the edit
- User is on Windows (PowerShell terminal)