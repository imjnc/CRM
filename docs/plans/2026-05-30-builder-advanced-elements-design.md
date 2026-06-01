# Phase 5: Advanced Elements & Shortcuts Design

## Overview
Expand the builder's element library beyond basic rectangles and circles. Add native lines, arrows, and complex shapes like stars, polygons, and hearts, along with quick-add keyboard shortcuts to match standard Canva workflows.

## 1. Engine & Store Updates
- **Type Expansion:** Add `star`, `polygon`, `line`, `arrow`, `heart` to `CanvasElement.type`.
- **Properties:**
  - `points`: number[] (for lines/arrows to define start and end).
  - `sides`: number (for polygons like triangles, pentagons).
  - `stroke`: string (border/line color).
  - `strokeWidth`: number (border/line thickness).
  - `dash`: number[] (for dashed/dotted lines).
- **Default State:** Update `useBuilderStore` to handle these new properties safely.

## 2. Canvas Area Rendering
- **Konva Components:** Import `Star`, `RegularPolygon`, `Line`, `Arrow`, `Path` from `react-konva`.
- **Heart Implementation:** Use `Path` component with a standard SVG heart path string.
- **Keyboard Shortcuts:** 
  - Listen for `keydown`. If not typing in an input field (check `e.target`), spawn items:
  - `R` -> Rectangle
  - `C` -> Circle
  - `L` -> Line

## 3. Sidebar UI Updates
- **Left Sidebar:** Add a new "Lines & Shapes" grid containing buttons for Star, Triangle, Hexagon, Line, Arrow, and Heart.
- **Properties Panel:** If a line or arrow is selected, show `Stroke Width` and `Stroke Color` inputs, and a toggle for `Dashed` vs `Solid`. For other shapes, allow editing `stroke` (border) as well as `fill`.
