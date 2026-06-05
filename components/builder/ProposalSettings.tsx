import React, { useRef } from 'react';
import { useProposalStore } from '@/lib/stores/useProposalStore';
import { Settings2, Type, Image as ImageIcon, Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import LogoSettingsEditor from './LogoSettingsEditor';

export default function ProposalSettings() {
  const store = useProposalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeColorPicker, setActiveColorPicker] = React.useState<string | null>(null);

  const renderColorPicker = (label: string, value: string, onChange: (color: string) => void, id: string) => (
    <div className="flex flex-col gap-1.5 mt-2 relative">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <div 
          onClick={() => setActiveColorPicker(activeColorPicker === id ? null : id)}
          className="h-8 w-8 rounded cursor-pointer border border-gray-200 shadow-sm relative overflow-hidden flex-shrink-0"
        >
          <div className="absolute inset-0" style={{ backgroundColor: value }} />
        </div>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="text-sm border border-gray-200 rounded-md px-2 py-1.5 w-full focus:ring-1 focus:ring-black font-mono" />
      </div>
      
      {activeColorPicker === id && (
        <div className="absolute top-16 left-0 z-50 bg-white p-3 rounded-lg shadow-xl border border-gray-100 flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
             <span className="text-xs font-medium text-gray-700">Custom Color</span>
             <button onClick={() => setActiveColorPicker(null)} className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-gray-900 font-medium bg-gray-100 px-2 py-1 rounded">Close</button>
          </div>
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center justify-center text-center gap-3 border-b border-gray-100 pb-5">
         <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
           <Settings2 size={24} />
         </div>
         <div className="text-sm text-gray-800 font-bold">Document Settings</div>
         <div className="text-xs text-gray-400">Configure the proposal layout and style.</div>
      </div>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5"><ImageIcon size={14} /> Client Logo</h2>
        <LogoSettingsEditor />
      </section>

      <section className="border-t border-gray-100 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5"><Palette size={14} /> Brand Colors</h2>
        <div className="flex flex-col gap-3">
          {renderColorPicker('Primary Color', store.brandColors.primary, (c) => useProposalStore.setState(s => ({ brandColors: { ...s.brandColors, primary: c } })), 'brand-primary')}
          {renderColorPicker('Secondary Color', store.brandColors.secondary, (c) => useProposalStore.setState(s => ({ brandColors: { ...s.brandColors, secondary: c } })), 'brand-secondary')}
          {renderColorPicker('Text Color', store.brandColors.text, (c) => useProposalStore.setState(s => ({ brandColors: { ...s.brandColors, text: c } })), 'brand-text')}
          {renderColorPicker('Background Color', store.brandColors.bg, (c) => useProposalStore.setState(s => ({ brandColors: { ...s.brandColors, bg: c } })), 'brand-bg')}
        </div>
      </section>

      <section className="border-t border-gray-100 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Table Settings</h2>
        
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-2">Visible Columns</label>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              {Object.keys(store.visibleColumns).map(col => (
                <label key={col} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={store.visibleColumns[col]} 
                    onChange={(e) => store.updateVisibleColumns(col, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize">{col.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <label className="text-xs font-medium text-gray-700 block mb-2">Table Colors</label>
            {renderColorPicker('Header Bg', store.tableStyle.headerBg, (c) => store.updateTheme({ headerBg: c }), 'tbl-hbg')}
            {renderColorPicker('Header Text', store.tableStyle.headerText, (c) => store.updateTheme({ headerText: c }), 'tbl-htxt')}
            {renderColorPicker('Body Bg', store.tableStyle.bodyBg, (c) => store.updateTheme({ bodyBg: c }), 'tbl-bbg')}
            {renderColorPicker('Alt Row Bg', store.tableStyle.altRowBg, (c) => store.updateTheme({ altRowBg: c }), 'tbl-abg')}
            {renderColorPicker('Border', store.tableStyle.borderColor, (c) => store.updateTheme({ borderColor: c }), 'tbl-brd')}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5"><Type size={14} /> Typography</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 font-medium">Font Family</label>
          <select 
            value={store.typography.fontFamily} 
            onChange={(e) => useProposalStore.setState(s => ({ typography: { ...s.typography, fontFamily: e.target.value } }))}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black bg-white"
          >
            {['Inter', 'Roboto', 'Poppins', 'Open Sans', 'Montserrat'].map(font => 
              <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
            )}
          </select>
        </div>
      </section>

    </div>
  );
}
