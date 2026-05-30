# Lead Design Builder - Phase 2 (Part 2: Properties & Shortcuts)

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Allow users to dynamically edit the properties (colors, text, size) of the shapes they drop on the canvas, add global brand colors, and add keyboard shortcuts for faster design (Delete, Duplicate).

**Architecture:** 
- Enhance `BuilderLayout.tsx` Right Sidebar to show different inputs based on the `selectedId`.
- Add a new `removeElement` action to `useBuilderStore.ts`.
- Add a generic Keydown event listener inside `CanvasArea.tsx` or `BuilderLayout.tsx` for `Backspace/Delete` and `Ctrl+D`.
- Create a `Brand Kit` color palette section in the sidebar.

**Tech Stack:** React, Zustand, lucide-react.

---

### Task 1: Add Delete/Duplicate & Keyboard Shortcuts

**Files:**
- Modify: `lib/stores/useBuilderStore.ts`
- Modify: `components/builder/CanvasArea.tsx`

**Step 1:** Store Updates
Add `removeElement: (id: string) => void` to Zustand to remove an item.
Add `duplicateElement: (id: string) => void` to Zustand to duplicate an item with a slight X/Y offset.

**Step 2:** Keyboard Events
In `CanvasArea.tsx` (or a `useEffect` wrapper), listen for `keydown`. 
- If `Backspace` or `Delete` is pressed, call `removeElement(selectedId)`.
- If `Ctrl + D` or `Cmd + D` is pressed, call `duplicateElement(selectedId)` and `e.preventDefault()`.

---

### Task 2: Build the Dynamic Properties Panel

**Files:**
- Modify: `components/builder/BuilderLayout.tsx`

**Step 1:** Read Selected Element
Use `useBuilderStore` to find the object of the currently `selectedId`.

**Step 2:** Render Dynamic Inputs (Right Sidebar)
If an element is selected:
- **If Text**: Show a Text Input for the text value, Number Input for font size, and Color Input for fill color.
- **If Rect/Circle**: Show Color Inputs for fill.

Wire these inputs up to call `updateElement(selectedId, { newProperties })`.

---

### Task 3: Global Brand Colors Palette

**Files:**
- Modify: `components/builder/BuilderLayout.tsx`

**Step 1:** Hardcode Brand Colors
Create a small palette of 5-6 brand colors (e.g., Brand Blue, Brand Dark, Brand Gray) in the properties panel or the left sidebar.

**Step 2:** Click to Apply
When an element is selected, clicking a brand color instantly calls `updateElement(selectedId, { fill: colorHex })`.
