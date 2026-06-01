# Phase 4: Advanced Properties & Context Menu Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

## Overview
Implement the design described in `docs/plans/2026-05-30-builder-advanced-properties-design.md`.

## Task 1: Store & Data Engine Updates
**File:** `lib/stores/useBuilderStore.ts`
- Update `CanvasElement` type with new properties: `fontFamily, fontStyle, textDecoration, align, letterSpacing, lineHeight, opacity, rotation`.
- Add `clipboard: CanvasElement | null` to state.
- Add actions:
  - `copyElement: () => void` (copies `elements.find(id === selectedId)` to `clipboard`).
  - `pasteElement: () => void` (creates new element from `clipboard` with slight x/y offset, generates new id).
  - `bringToFront: (id: string) => void` (moves element to end of array).
  - `sendToBack: (id: string) => void` (moves element to start of array).
- Make sure `bringToFront` and `sendToBack` call `saveHistory` for Undo/Redo.

## Task 2: Right-Click Context Menu
**File:** `components/builder/CanvasArea.tsx`
- Add state: `const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, visible: false })`.
- On Stage `onContextMenu`, prevent default `e.evt.preventDefault()`. If target is an element, select it, show menu at `e.evt.clientX`, `clientY`.
- On Stage `onClick`, hide context menu.
- Render the HTML menu as absolute div outside the Stage (or wrapped in a relatively positioned container). Since `CanvasArea` is inside a flex layout, absolute positioning should work if the parent wrapper is relative.
- Implement menu buttons: Copy, Paste, Duplicate, Delete, Bring to Front, Send to Back.
- Implement Align to Page (Left: x=0, Center: x=400 - width/2, Right: x=800-width).
- Update Konva `Rect`, `Circle`, `Text`, `URLImage` components to pass `opacity` and `rotation`.
- Update `Text` component to pass `fontFamily`, `fontStyle`, `textDecoration`, `align`, `letterSpacing`, `lineHeight`.

## Task 3: Advanced Properties Panel
**File:** `components/builder/BuilderLayout.tsx`
- Reorganize Right Sidebar into sections.
- **Layout:** Add number inputs for `x`, `y`, `width`, `height`, `rotation`.
- **Appearance:** Add range input for `opacity` (0-100, maps to 0-1).
- **Typography (only if Text selected):**
  - Select dropdown for `fontFamily`.
  - Buttons for Bold/Italic (updates `fontStyle`).
  - Buttons for Underline/Strikethrough (updates `textDecoration`).
  - Select or buttons for `align`.
  - Number inputs for `letterSpacing` and `lineHeight`.
