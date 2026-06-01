# Lead Design Builder - Phase 3 (Export, Auto-Fill, Undo/Redo)

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Finalize the core builder workflow by allowing users to undo mistakes, export their designs as images/PDFs, and auto-inject lead data from the CRM database.

**Architecture:** 
- Add `jspdf` for PDF generation.
- Implement time-travel state in Zustand for Undo/Redo.
- Expose the Konva `Stage` instance to the global store so the header "Save Design" button can extract the Data URL.
- Fetch Lead context in the page server component (or client component) and populate an "Auto-Fill" tool in the sidebar.

---

### Task 1: Time Travel (Undo/Redo)

**Files:**
- Modify: `lib/stores/useBuilderStore.ts`
- Modify: `components/builder/CanvasArea.tsx`

**Step 1:** Store History
Update `useBuilderStore` to track `history: CanvasElement[][]` and `historyStep: number`.
Every time an element is added, updated, removed, or duplicated, push the new `elements` array to `history` and increment `historyStep`.
Create `undo()` and `redo()` actions that navigate the `history` array.

**Step 2:** Keyboard Shortcuts
In `CanvasArea.tsx` `handleKeyDown`, add listeners for `Ctrl+Z` (Undo) and `Ctrl+Y` or `Ctrl+Shift+Z` (Redo).

---

### Task 2: Export Engine (PNG & PDF)

**Files:**
- Modify: `lib/stores/useBuilderStore.ts`
- Modify: `components/builder/CanvasArea.tsx`
- Modify: `components/builder/BuilderLayout.tsx`
- Run: `npm install jspdf`

**Step 1:** Stage Reference
Add a `setStageRef: (ref: any) => void` and `getStageRef: () => any` (or just store it) in `useBuilderStore`.
In `CanvasArea.tsx`, inside `useEffect`, call `setStageRef(stageRef.current)`.

**Step 2:** Export Logic
In `BuilderLayout.tsx`, change "Save Design" to "Export". Create a dropdown or two buttons: "Export PNG" and "Export PDF".
- **PNG**: Get the stage ref, call `stage.toDataURL({ pixelRatio: 2 })`, create a hidden `<a>` tag, and trigger a download.
- **PDF**: Use `jsPDF` to create a new PDF document, add the `stage.toDataURL()` image to it, and call `pdf.save('proposal.pdf')`.

---

### Task 3: CRM Context Auto-Fill

**Files:**
- Modify: `app/leads/[id]/build/page.tsx`
- Modify: `components/builder/BuilderLayout.tsx`

**Step 1:** Pass Lead Data
In `page.tsx`, use the `id` from `params` to fetch the Lead data from the API (`/api/leads/${id}`). Pass this data as a prop down to `BuilderLayout`.

**Step 2:** Auto-Fill Tool
In `BuilderLayout.tsx`'s left sidebar, add a new section: **CRM Data**.
Display the lead's Name, Email, and Company.
Add a button: "Inject Lead Data" that maps over these fields and calls `addElement` for each string, dropping them onto the canvas neatly formatted.
