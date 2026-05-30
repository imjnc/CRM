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
