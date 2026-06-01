# Phase 5: Advanced Elements Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

## Task 1: Store & Engine Data Expansion
**File:** `lib/stores/useBuilderStore.ts`
- Expand `type CanvasElement` to include new shapes: `'star' | 'polygon' | 'line' | 'arrow' | 'heart'`.
- Add optional properties: `points?: number[]`, `sides?: number`, `stroke?: string`, `strokeWidth?: number`, `dash?: number[]`, `scaleX?: number`, `scaleY?: number`.
- Ensure `updateElement` safely spreads these. Note: `line` and `arrow` use `points` instead of width/height and resize differently via scaling or directly modifying points. We will use scaling to keep it simple, so `scaleX` and `scaleY` should be persisted for lines.

## Task 2: Canvas Area Rendering & Shortcuts
**File:** `components/builder/CanvasArea.tsx`
- Import `Star, RegularPolygon, Line, Arrow, Path` from `react-konva`.
- **Keyboard Shortcuts:** In `handleKeyDown`, verify `document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA'`. If true, map `r` to `addElement({ type: 'rect', ... })`, `c` to `circle`, `l` to `line`.
- **Render Switch:** 
  - `'star'`: `<Star numPoints={5} innerRadius={20} outerRadius={40} ... />`
  - `'polygon'`: `<RegularPolygon sides={el.sides || 3} radius={el.radius || 40} ... />`
  - `'line'`: `<Line points={el.points || [0, 0, 100, 0]} stroke={el.stroke || '#000'} strokeWidth={el.strokeWidth || 4} dash={el.dash} ... />`
  - `'arrow'`: `<Arrow points={el.points || [0, 0, 100, 0]} stroke={el.stroke || '#000'} strokeWidth={el.strokeWidth || 4} dash={el.dash} ... />`
  - `'heart'`: `<Path data="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z" ... />` (Note: we will need to scale or center the heart path).
- Ensure `onTransformEnd` tracks `scaleX` and `scaleY` for lines/arrows/paths since width/height won't work on them properly without points math.

## Task 3: Sidebar UI Integration
**File:** `components/builder/BuilderLayout.tsx`
- **Left Sidebar:** Add buttons for Line, Arrow, Triangle (polygon sides 3), Star, Heart. Group them cleanly in the "Add Elements" section.
- **Properties Panel:**
  - If type is `line` or `arrow`, show `Stroke Color` and `Stroke Width` inputs, and a dropdown for `Line Style` (Solid vs Dashed).
  - For other shapes, allow editing `Stroke Color` (border) alongside `Fill Color`.
