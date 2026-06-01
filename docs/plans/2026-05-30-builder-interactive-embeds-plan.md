# Phase 6: Interactive Embeds & Data Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

## Task 1: Setup Dependencies & Store
**Action:** `npm install react-konva-utils recharts`
**File:** `lib/stores/useBuilderStore.ts`
- Add `type: 'embed' | 'chart'` to `CanvasElement`.
- Add `embedUrl?: string`, `chartType?: 'bar' | 'line' | 'pie'`, `chartData?: any[]`.
- In `addElement`, initialize defaults for `chart` (e.g. `chartData: [{name: 'Q1', value: 400}, {name: 'Q2', value: 300}, {name: 'Q3', value: 200}, {name: 'Q4', value: 278}]`, `chartType: 'bar'`) and for `embed` (e.g. `embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'`).

## Task 2: Canvas Integration
**File:** `components/builder/CanvasArea.tsx`
- Import `{ Html } from 'react-konva-utils'` and `{ BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'`.
- Inside `elements.map`, add rendering for `embed` and `chart`.
- Both will be wrapped in a `<Group>` so we can have a drag handle.
- `<Group x={el.x} y={el.y} draggable onDragEnd={...}>`
  - `<Rect width={el.width} height={24} fill="#e5e7eb" cornerRadius={[4,4,0,0]} />` (Drag Handle)
  - `<Text text={el.type.toUpperCase()} x={8} y={6} fontSize={10} fill="#6b7280" fontStyle="bold" />`
  - `<Html divProps={{ style: { width: el.width, height: el.height - 24, pointerEvents: 'auto', backgroundColor: 'white', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 4px 4px' } }}>`
    - If `embed`: `<iframe src={el.embedUrl} width="100%" height="100%" frameBorder="0" allowFullScreen />`
    - If `chart`: render Recharts `<ResponsiveContainer>` with the specific `el.chartType` chart.

## Task 3: Properties Panel Integration
**File:** `components/builder/BuilderLayout.tsx`
- **Left Sidebar:** Add "Advanced Media" section with "Live Embed" and "Data Chart" buttons.
- **Properties Panel:**
  - If `selectedElement.type === 'embed'`, add a section "Embed Settings" with an input for `embedUrl`.
  - If `selectedElement.type === 'chart'`, add a section "Chart Settings" with:
    - Select dropdown for `chartType` (`bar`, `line`, `pie`).
    - A simple map over `selectedElement.chartData` rendering inputs so the user can change values and names dynamically, updating via `updateElement(id, { chartData: newData })`.
