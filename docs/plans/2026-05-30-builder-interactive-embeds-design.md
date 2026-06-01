# Phase 6: Interactive Embeds & Data Engine Design

## Overview
This phase elevates the builder beyond Canva's static constraints by allowing live interactive web embeds (YouTube, Forms) and interactive, data-driven charts (Recharts) positioned perfectly over the canvas.

## 1. Dependencies
- Install `react-konva-utils` for the `<Html>` component to overlay DOM elements on the canvas.
- Install `recharts` to render beautiful SVG/HTML based charts.

## 2. Store & Engine Updates
- Add `type: 'embed' | 'chart'` to `CanvasElement`.
- Add `embedUrl?: string` (e.g., `https://www.youtube.com/embed/...`).
- Add `chartType?: 'bar' | 'line' | 'pie'`.
- Add `chartData?: { name: string, value: number }[]` (e.g., `[{name: 'Q1', value: 400}, ...]`).

## 3. Canvas Area Rendering
- Use Konva `Group` to group the logic.
- For `'embed'` and `'chart'`, render a Konva `Rect` as a "Drag Handle / Title Bar" at the top (height: 24px) so the user can easily drag the element without the iframe stealing the mouse events.
- Render the `<Html>` component directly below the drag handle.
- If `'embed'`, render `<iframe src={el.embedUrl} style={{ width: '100%', height: '100%', pointerEvents: 'auto' }} />`.
- If `'chart'`, render a `recharts` `ResponsiveContainer` with the corresponding chart type.

## 4. Sidebar UI Integration
- Add "Interactive Embed" and "Live Chart" buttons to the Left Sidebar under a new "Advanced Media" section.
- Properties Panel for `embed`: Input field to paste the URL.
- Properties Panel for `chart`: 
  - Dropdown to switch between Bar, Line, and Pie.
  - A small data editor (JSON or text inputs) to update `chartData` dynamically.
