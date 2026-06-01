# Lead Design Builder - Phase 2 (Part 1: Assets & Branding)

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement the Asset Library (Image Uploads) and the QR Code Generator, and allow rendering of Images on the Canvas.

**Architecture:** 
- Enhance `CanvasElement` in Zustand to support `type: 'image'` with an `src` string.
- Create an `ImageElement` component that uses `useImage` from `use-image` hook to render `<Image />` in Konva.
- Add an Image Upload button in the sidebar that reads a file via `FileReader` and drops it as a Base64 string onto the canvas.
- Add a QR Code Generator tab in the sidebar that generates a QR code data URL (using `qrcode` package) and drops it as an image.

**Tech Stack:** React, react-konva, use-image, qrcode, Zustand.

---

### Task 1: Support Images in Canvas Store & Renderer

**Files:**
- Modify: `lib/stores/useBuilderStore.ts`
- Modify: `components/builder/CanvasArea.tsx`
- Run: `npm install use-image qrcode` `npm install -D @types/qrcode`

**Step 1:** Update Store
Update the `CanvasElement` type to include `'image'` and an `src?: string` property.

**Step 2:** Create Custom Image Component
In `CanvasArea.tsx`, create a wrapper component `<URLImage />` that uses `useImage(src)` and renders a Konva `<Image />`. Add it to the rendering switch statement.

---

### Task 2: Implement Asset Upload (Sidebar)

**Files:**
- Modify: `components/builder/BuilderLayout.tsx`

**Step 1:** Add File Input
Add a hidden `<input type="file" accept="image/*" />` to the sidebar. 
Add an "Upload Image" button that triggers the file input click.

**Step 2:** Handle Upload
When a file is selected, use `FileReader` to read it as a Data URL (`readAsDataURL`).
Once loaded, call `addElement({ type: 'image', x: 50, y: 50, width: 200, height: 200, src: reader.result })`.

---

### Task 3: Implement QR Code Generator (Sidebar)

**Files:**
- Modify: `components/builder/BuilderLayout.tsx`

**Step 1:** QR Code UI
Add a small form in the sidebar containing a Text Input for "URL/Text" and a "Generate QR" button.

**Step 2:** Generate and Add
When clicked, use `QRCode.toDataURL(text)` from the `qrcode` package.
Take the resulting Data URL and add it to the canvas: `addElement({ type: 'image', x: 50, y: 50, width: 150, height: 150, src: qrDataUrl })`.
