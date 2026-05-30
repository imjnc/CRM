# Lead Design Builder - Phase 1 (Part 2: Core Interactivity)

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement the core interactive features of the design builder, including adding shapes/text, drag-and-drop, resizing, and global state management.

**Architecture:** Use `zustand` to manage an array of canvas elements (rectangles, circles, text). Use Konva's `Transformer` component to handle selection, resizing, and rotation. Add a basic toolbar in the left sidebar to add new elements.

**Tech Stack:** React, react-konva, Zustand, Tailwind CSS, Lucide React.

---

### Task 1: Create Zustand Store for Canvas Elements

**Files:**
- Create: `lib/stores/useBuilderStore.ts`

**Step 1: Write the minimal implementation**

Create the state manager to hold our canvas elements.

```ts
import { create } from 'zustand';

export type CanvasElement = {
  id: string;
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  text?: string;
  fontSize?: number;
};

interface BuilderState {
  elements: CanvasElement[];
  selectedId: string | null;
  addElement: (element: Omit<CanvasElement, 'id'>) => void;
  updateElement: (id: string, attrs: Partial<CanvasElement>) => void;
  selectElement: (id: string | null) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  elements: [],
  selectedId: null,
  addElement: (element) => set((state) => ({
    elements: [...state.elements, { ...element, id: Date.now().toString() }]
  })),
  updateElement: (id, attrs) => set((state) => ({
    elements: state.elements.map((el) => el.id === id ? { ...el, ...attrs } : el)
  })),
  selectElement: (id) => set({ selectedId: id })
}));
```

**Step 2: Commit**
```bash
git add lib/stores/useBuilderStore.ts
git commit -m "feat(builder): add zustand store for canvas elements"
```

---

### Task 2: Implement Transformer and Element Rendering

**Files:**
- Modify: `components/builder/CanvasArea.tsx`

**Step 1: Write the minimal implementation**

Update `CanvasArea.tsx` to render elements from the store and handle selection/dragging.

```tsx
"use client";

import { Stage, Layer, Rect, Circle, Text, Transformer } from "react-konva";
import { useEffect, useState, useRef } from "react";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";

export default function CanvasArea() {
  const [mounted, setMounted] = useState(false);
  const { elements, selectedId, selectElement, updateElement } = useBuilderStore();
  const trRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, elements]);

  if (!mounted) return null;

  return (
    <Stage 
      width={800} 
      height={600} 
      ref={stageRef}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) {
          selectElement(null);
        }
      }}
    >
      <Layer>
        <Rect width={800} height={600} fill="#ffffff" />
        
        {elements.map((el) => {
          const commonProps = {
            key: el.id,
            id: el.id,
            x: el.x,
            y: el.y,
            fill: el.fill,
            draggable: true,
            onClick: () => selectElement(el.id),
            onTap: () => selectElement(el.id),
            onDragEnd: (e: any) => {
              updateElement(el.id, { x: e.target.x(), y: e.target.y() });
            },
            onTransformEnd: (e: any) => {
              const node = e.target;
              updateElement(el.id, {
                x: node.x(),
                y: node.y(),
                width: node.width() * node.scaleX(),
                height: node.height() * node.scaleY(),
              });
              node.scaleX(1);
              node.scaleY(1);
            }
          };

          if (el.type === 'rect') return <Rect {...commonProps} width={el.width} height={el.height} />;
          if (el.type === 'circle') return <Circle {...commonProps} radius={el.radius} />;
          if (el.type === 'text') return <Text {...commonProps} text={el.text} fontSize={el.fontSize} />;
          return null;
        })}
        
        {selectedId && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox} />}
      </Layer>
    </Stage>
  );
}
```

**Step 2: Commit**
```bash
git add components/builder/CanvasArea.tsx
git commit -m "feat(builder): render elements dynamically and add transformer"
```

---

### Task 3: Add Elements Sidebar

**Files:**
- Modify: `components/builder/BuilderLayout.tsx`

**Step 1: Write the minimal implementation**

Add buttons in the left sidebar to add shapes to the canvas.

```tsx
// At the top of BuilderLayout.tsx
"use client";
import { Type, Square, Circle as CircleIcon } from "lucide-react";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";

// Replace the left aside content with:
export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const addElement = useBuilderStore((state) => state.addElement);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <h1 className="font-semibold text-gray-900">Design Builder</h1>
        <div className="flex gap-2">
          <button className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-200">Preview</button>
          <button className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-black">Save Design</button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Add Elements</h2>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => addElement({ type: 'text', x: 50, y: 50, text: 'Heading', fontSize: 32, fill: '#111827' })}
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50"
            >
              <Type size={20} className="text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Text</span>
            </button>
            <button 
              onClick={() => addElement({ type: 'rect', x: 100, y: 100, width: 100, height: 100, fill: '#3b82f6' })}
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50"
            >
              <Square size={20} className="text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Rectangle</span>
            </button>
            <button 
              onClick={() => addElement({ type: 'circle', x: 150, y: 150, radius: 50, fill: '#ef4444' })}
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50"
            >
              <CircleIcon size={20} className="text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Circle</span>
            </button>
          </div>
        </aside>
        
        <main className="flex-1 overflow-auto p-8 flex flex-col items-center">
          {children}
        </main>
        
        <aside className="w-64 border-l border-gray-200 bg-white p-4 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Properties</h2>
          <div className="text-sm text-gray-400 italic">Select an element to edit properties</div>
        </aside>
      </div>
    </div>
  )
}
```

**Step 2: Commit**
```bash
git add components/builder/BuilderLayout.tsx
git commit -m "feat(builder): add toolbar to insert canvas elements"
```
