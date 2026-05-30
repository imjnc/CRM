# Phase 4: Advanced Properties & Context Menu Design

## Overview
This phase expands the builder's capabilities to match professional design tools like Canva. It introduces a fully featured right-click context menu and a comprehensive properties panel for fine-grained control over typography, layout, and appearance.

## 1. Context Menu (HTML Overlay)
- **Trigger:** Intercept `onContextMenu` on Konva nodes (or the Stage).
- **Positioning:** Store `{ x, y, visible }` in local React state inside `CanvasArea`.
- **Styling:** Floating absolute `div` over the canvas, using Tailwind for shadows and hover states.
- **Actions:**
  - Copy / Paste (Uses a `clipboard` object in Zustand).
  - Duplicate / Delete.
  - Bring to Front / Send to Back (Moves the element's index in the `elements` array).
  - Align to Page (Left, Center, Right, Top, Middle, Bottom). Sets `x` and `y` based on `800x600` canvas size.

## 2. Advanced Properties Panel (Right Sidebar)
- **Layout & Position:** Inputs for `x`, `y`, `width`, `height`, and `rotation`.
- **Appearance:** `opacity` slider (0-100 mapped to 0-1).
- **Typography:**
  - `fontFamily`: Dropdown (Arial, Inter, Roboto, Helvetica, Times New Roman).
  - Font Styles: Bold/Italic map to Konva's `fontStyle`.
  - Decoration: Underline/Strikethrough map to Konva's `textDecoration`.
  - Alignment: Left/Center/Right map to Konva's `align`.
  - Spacing: `letterSpacing` and `lineHeight` inputs.

## 3. Data Engine (Zustand)
Update `CanvasElement` type to include:
- `fontFamily?: string`
- `fontStyle?: string` (bold, italic, bold italic, normal)
- `textDecoration?: string` (underline, line-through, empty string)
- `align?: string`
- `letterSpacing?: number`
- `lineHeight?: number`
- `opacity?: number`
- `rotation?: number`

Update store to include:
- `clipboard: CanvasElement | null`
- `copyElement: () => void`
- `pasteElement: () => void`
- `bringToFront: (id: string) => void`
- `sendToBack: (id: string) => void`
