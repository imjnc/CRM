import { create } from 'zustand';

export interface ProductItem {
  id: string;
  image?: string;
  name: string;
  description: string;
  qty: number;
  sellingPrice: number;
  discount: number;
  tax: number;
}

interface ProposalState {
  // Row 1
  clientLogo: string | null;
  logoSettings: {
    crop: { x: number; y: number };
    zoom: number;
    rotation: number;
    flipH: boolean;
    flipV: boolean;
    shape: 'square' | 'circle' | 'rounded' | 'custom';
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    backgroundColor: string;
    shadow: boolean;
    opacity: number;
    padding: number;
    width: number;
    height: number;
  };
  showQR: boolean;
  qrType: string;
  
  headerInfo: {
    name: string;
    title: string;
    org: string;
    email: string;
    mobile: string;
  };
  
  // Row 2 Table
  products: ProductItem[];
  visibleColumns: Record<string, boolean>;
  tableTheme: 'corporate' | 'minimal' | 'brand';
  tableStyle: {
    headerBg: string;
    headerText: string;
    bodyBg: string;
    altRowBg: string;
    borderColor: string;
  };
  
  // Notes
  notes: string;
  
  // Row 3
  clientDetails: {
    name: string;
    industry: string;
    status: string;
  };
  orgDetails: {
    company: string;
    email: string;
    phone: string;
  };
  
  // Footer
  footerInfo: {
    terms: string;
    preparedBy: string;
  };
  
  // Branding
  brandColors: { primary: string; secondary: string; text: string; bg: string };
  typography: { fontFamily: string; fontSize: number };
  
  // Actions
  setProducts: (products: ProductItem[]) => void;
  addProduct: () => void;
  updateProduct: (id: string, updates: Partial<ProductItem>) => void;
  removeProduct: (id: string) => void;
  moveProduct: (id: string, direction: 'up' | 'down') => void;
  updateTheme: (theme: Partial<ProposalState['tableStyle']>) => void;
  updateVisibleColumns: (col: string, visible: boolean) => void;
  updateLogoSettings: (updates: Partial<ProposalState['logoSettings']>) => void;
  updateHeaderInfo: (updates: Partial<ProposalState['headerInfo']>) => void;
  updateClientDetails: (updates: Partial<ProposalState['clientDetails']>) => void;
  updateOrgDetails: (updates: Partial<ProposalState['orgDetails']>) => void;
  updateFooterInfo: (updates: Partial<ProposalState['footerInfo']>) => void;
}

export const useProposalStore = create<ProposalState>((set, get) => ({
  clientLogo: null,
  logoSettings: { 
    crop: { x: 0, y: 0 }, 
    zoom: 1, 
    rotation: 0, 
    flipH: false, 
    flipV: false,
    shape: 'circle',
    borderRadius: 50, // Percentage or px depending on shape
    borderWidth: 2,
    borderColor: '#f3f4f6', 
    backgroundColor: 'transparent',
    shadow: false,
    opacity: 1,
    padding: 4,
    width: 80,
    height: 80
  },
  showQR: true,
  qrType: 'email',
  
  headerInfo: {
    name: 'John Doe',
    title: 'Senior Director',
    org: 'Acme Corp',
    email: 'john.doe@example.com',
    mobile: '+1 234 567 8900'
  },
  
  products: [
    { id: '1', name: 'Premium Service', description: 'Annual subscription', qty: 1, sellingPrice: 1000, discount: 0, tax: 180 }
  ],
  visibleColumns: {
    srNo: true, image: true, name: true, description: true, qty: true, sellingPrice: true, discount: true, tax: true, total: true
  },
  tableTheme: 'corporate',
  tableStyle: {
    headerBg: '#111827', headerText: '#ffffff', bodyBg: '#ffffff', altRowBg: '#f9fafb', borderColor: '#e5e7eb'
  },
  
  notes: 'Payment is due within 30 days.\nThank you for your business.',
  
  clientDetails: {
    name: 'John Doe',
    industry: 'Software',
    status: 'Qualified'
  },
  orgDetails: {
    company: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '+1 800 555 0199'
  },
  
  footerInfo: {
    terms: 'Terms & Conditions Apply.',
    preparedBy: 'Sales Team'
  },
  
  brandColors: { primary: '#3b82f6', secondary: '#1e40af', text: '#111827', bg: 'transparent' },
  typography: { fontFamily: 'Inter', fontSize: 14 },
  
  setProducts: (products) => set({ products }),
  addProduct: () => set((state) => ({ 
    products: [...state.products, { id: Date.now().toString(), name: 'New Item', description: '', qty: 1, sellingPrice: 0, discount: 0, tax: 0 }] 
  })),
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  removeProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) })),
  moveProduct: (id, direction) => set((state) => {
    const idx = state.products.findIndex(p => p.id === id);
    if (idx < 0) return state;
    if (direction === 'up' && idx === 0) return state;
    if (direction === 'down' && idx === state.products.length - 1) return state;
    const newProducts = [...state.products];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newProducts[idx], newProducts[targetIdx]] = [newProducts[targetIdx], newProducts[idx]];
    return { products: newProducts };
  }),
  updateTheme: (theme) => set((state) => ({ tableStyle: { ...state.tableStyle, ...theme } })),
  updateVisibleColumns: (col, visible) => set((state) => ({ visibleColumns: { ...state.visibleColumns, [col]: visible } })),
  
  updateLogoSettings: (updates) => set((state) => ({ logoSettings: { ...state.logoSettings, ...updates } })),
  updateHeaderInfo: (updates) => set((state) => ({ headerInfo: { ...state.headerInfo, ...updates } })),
  updateClientDetails: (updates) => set((state) => ({ clientDetails: { ...state.clientDetails, ...updates } })),
  updateOrgDetails: (updates) => set((state) => ({ orgDetails: { ...state.orgDetails, ...updates } })),
  updateFooterInfo: (updates) => set((state) => ({ footerInfo: { ...state.footerInfo, ...updates } }))
}));
