import { create } from 'zustand';

export type CanvasElement = {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  src?: string;
};

interface BuilderState {
  elements: CanvasElement[];
  selectedId: string | null;
  history: CanvasElement[][];
  historyStep: number;
  stageRef: any | null;
  setStageRef: (ref: any) => void;
  addElement: (element: Omit<CanvasElement, 'id'>) => void;
  updateElement: (id: string, attrs: Partial<CanvasElement>) => void;
  selectElement: (id: string | null) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => {
  const saveHistory = (newElements: CanvasElement[]) => {
    const { history, historyStep } = get();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    return {
      elements: newElements,
      history: newHistory,
      historyStep: newHistory.length - 1
    };
  };

  return {
    elements: [],
    selectedId: null,
    history: [[]],
    historyStep: 0,
    stageRef: null,

    setStageRef: (ref) => set({ stageRef: ref }),

    addElement: (element) => set((state) => {
      const newElements = [...state.elements, { ...element, id: Date.now().toString() }];
      return saveHistory(newElements);
    }),

    updateElement: (id, attrs) => set((state) => {
      const newElements = state.elements.map((el) => el.id === id ? { ...el, ...attrs } : el);
      return saveHistory(newElements);
    }),

    selectElement: (id) => set({ selectedId: id }),

    removeElement: (id) => set((state) => {
      const newElements = state.elements.filter((el) => el.id !== id);
      const newState = saveHistory(newElements);
      return { ...newState, selectedId: state.selectedId === id ? null : state.selectedId };
    }),

    duplicateElement: (id) => set((state) => {
      const elToDuplicate = state.elements.find((el) => el.id === id);
      if (!elToDuplicate) return state;
      
      const newElement = { 
        ...elToDuplicate, 
        id: Date.now().toString(),
        x: elToDuplicate.x + 20, 
        y: elToDuplicate.y + 20 
      };
      
      const newElements = [...state.elements, newElement];
      const newState = saveHistory(newElements);
      return { ...newState, selectedId: newElement.id };
    }),

    undo: () => set((state) => {
      if (state.historyStep === 0) return state;
      const newStep = state.historyStep - 1;
      return {
        historyStep: newStep,
        elements: state.history[newStep],
        selectedId: null
      };
    }),

    redo: () => set((state) => {
      if (state.historyStep === state.history.length - 1) return state;
      const newStep = state.historyStep + 1;
      return {
        historyStep: newStep,
        elements: state.history[newStep],
        selectedId: null
      };
    })
  };
});
