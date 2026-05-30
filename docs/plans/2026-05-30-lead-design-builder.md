# Lead Design Builder Phase 1 Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Create a Canva-style design builder in the CRM to allow users to generate flyers and proposals pre-filled with Lead data.

**Architecture:** We will add a Build button to the leads page that navigates to `/leads/[id]/build`. The builder page will use `react-konva` for the canvas rendering and `zustand` for state management (managing layers, undo/redo, and selected elements).

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, Lucide React, react-konva, Zustand.

---

### Task 1: Add "Build" button to Lead Row

**Files:**
- Modify: `app/leads/leads-client.tsx`
- Test: We will rely on manual visual testing for this initial UI addition.

**Step 1: Write the minimal implementation**

Update `app/leads/leads-client.tsx` to include the Build button in the actions column.

```tsx
// Inside the columns definition or the lead row render logic in leads-client.tsx
// Find the actions area and add:
import { Paintbrush } from "lucide-react";
import Link from "next/link";

// ... inside the table row rendering ...
<Link href={`/leads/${lead.id}/build`} className="flex items-center gap-1 text-[13px] text-amber-600 hover:text-amber-700">
  <Paintbrush size={14} />
  <span>Build</span>
</Link>
```

**Step 2: Commit**

```bash
git add app/leads/leads-client.tsx
git commit -m "feat(leads): add Build button linking to design builder"
```

---

### Task 2: Create Builder Page Route and Basic Layout

**Files:**
- Create: `app/leads/[id]/build/page.tsx`
- Create: `components/builder/BuilderLayout.tsx`

**Step 1: Write minimal implementation for BuilderLayout**

```tsx
// components/builder/BuilderLayout.tsx
export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <h1 className="font-semibold text-gray-900">Design Builder</h1>
        <div className="flex gap-2">
          <button className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-200">Preview</button>
          <button className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-black">Save</button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-200 bg-white p-4">Layers Panel</aside>
        <main className="flex-1 overflow-auto p-8">{children}</main>
        <aside className="w-64 border-l border-gray-200 bg-white p-4">Properties Panel</aside>
      </div>
    </div>
  )
}
```

**Step 2: Write minimal implementation for page route**

```tsx
// app/leads/[id]/build/page.tsx
import BuilderLayout from "@/components/builder/BuilderLayout";

export default function LeadBuilderPage({ params }: { params: { id: string } }) {
  return (
    <BuilderLayout>
      <div className="flex h-full items-center justify-center">
        <div className="h-[600px] w-[800px] bg-white shadow-lg ring-1 ring-gray-200">
          {/* Canvas will go here */}
          <div className="flex h-full items-center justify-center text-gray-400">Canvas Area</div>
        </div>
      </div>
    </BuilderLayout>
  )
}
```

**Step 3: Commit**

```bash
git add app/leads/[id]/build/page.tsx components/builder/BuilderLayout.tsx
git commit -m "feat(builder): scaffold builder layout and route"
```

---

### Task 3: Install Canvas Dependencies and Initialize Canvas

**Files:**
- Modify: `package.json`
- Create: `components/builder/CanvasArea.tsx`

**Step 1: Install Dependencies**

```bash
npm install konva react-konva zustand
```

**Step 2: Create Canvas Component**

```tsx
// components/builder/CanvasArea.tsx
"use client";

import { Stage, Layer, Rect, Text } from "react-konva";
import { useEffect, useState } from "react";

export default function CanvasArea() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Stage width={800} height={600}>
      <Layer>
        <Rect width={800} height={600} fill="#ffffff" />
        <Text text="Hello Lead Data" x={50} y={50} fontSize={24} fill="#111827" />
      </Layer>
    </Stage>
  );
}
```

**Step 3: Update page to use CanvasArea**

```tsx
// app/leads/[id]/build/page.tsx
import BuilderLayout from "@/components/builder/BuilderLayout";
import dynamic from "next/dynamic";

const CanvasArea = dynamic(() => import("@/components/builder/CanvasArea"), { ssr: false });

export default function LeadBuilderPage({ params }: { params: { id: string } }) {
  return (
    <BuilderLayout>
      <div className="flex h-full items-center justify-center">
        <div className="bg-white shadow-lg ring-1 ring-gray-200">
          <CanvasArea />
        </div>
      </div>
    </BuilderLayout>
  )
}
```

**Step 4: Commit**

```bash
git add package.json package-lock.json components/builder/CanvasArea.tsx app/leads/[id]/build/page.tsx
git commit -m "feat(builder): add react-konva canvas area"
```
