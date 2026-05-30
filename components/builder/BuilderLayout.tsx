"use client";

import { Type, Square, Circle as CircleIcon, Image as ImageIcon, QrCode, Download, Database, Undo, Redo, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Star, Heart, Minus, MoveRight, Hexagon, Triangle } from "lucide-react";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";
import { useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

const BRAND_COLORS = [
  '#111827', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', 'transparent'
];

const FONTS = ['Arial', 'Inter', 'Roboto', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia'];

export default function BuilderLayout({ children, lead }: { children: React.ReactNode, lead?: any }) {
  const { addElement, elements, selectedId, updateElement, stageRef, undo, redo, selectElement } = useBuilderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrText, setQrText] = useState("");

  const selectedElement = elements.find(el => el.id === selectedId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        addElement({ type: 'image', x: 50, y: 50, width: 200, height: 200, src: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerateQR = async () => {
    if (!qrText.trim()) return;
    try {
      const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1 });
      addElement({ type: 'image', x: 50, y: 50, width: 150, height: 150, src: qrDataUrl });
      setQrText("");
    } catch (err) {
      console.error("Failed to generate QR code", err);
    }
  };

  const exportPNG = () => {
    if (!stageRef) return;
    selectElement(null);
    setTimeout(() => {
      const dataURL = stageRef.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "design-export.png";
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100);
  };

  const exportPDF = () => {
    if (!stageRef) return;
    selectElement(null);
    setTimeout(() => {
      const dataURL = stageRef.toDataURL({ pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [800, 600] });
      pdf.addImage(dataURL, "PNG", 0, 0, 800, 600);
      pdf.save("design-export.pdf");
    }, 100);
  };

  const injectLeadData = () => {
    if (!lead) return;
    const yStart = 50;
    if (lead.name) addElement({ type: 'text', x: 50, y: yStart, text: lead.name, fontSize: 32, fill: '#111827' });
    if (lead.email) addElement({ type: 'text', x: 50, y: yStart + 40, text: lead.email, fontSize: 20, fill: '#4b5563' });
    if (lead.company) addElement({ type: 'text', x: 50, y: yStart + 70, text: lead.company, fontSize: 24, fill: '#3b82f6' });
  };

  const toggleFontStyle = (style: 'bold' | 'italic') => {
    if (!selectedElement) return;
    const current = selectedElement.fontStyle || 'normal';
    const hasStyle = current.includes(style);
    
    let newStyle = current;
    if (hasStyle) {
      newStyle = current.replace(style, '').trim();
    } else {
      newStyle = current === 'normal' ? style : `${current} ${style}`;
    }
    updateElement(selectedElement.id, { fontStyle: newStyle || 'normal' });
  };

  const renderColorPicker = (label: string, field: 'fill' | 'stroke') => {
    if (!selectedElement) return null;
    const value = selectedElement[field] || (field === 'fill' ? '#000000' : 'transparent');
    
    return (
      <div className="flex flex-col gap-1.5 mt-2">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <input type="color" value={value === 'transparent' ? '#ffffff' : value} onChange={(e) => updateElement(selectedElement.id, { [field]: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 p-0" />
          <span className="text-sm text-gray-600 font-mono uppercase">{value}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {BRAND_COLORS.map(color => (
            <button key={color} onClick={() => updateElement(selectedElement.id, { [field]: color })} className="w-5 h-5 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 flex items-center justify-center relative overflow-hidden" title={color}>
              {color === 'transparent' ? <div className="absolute inset-0 bg-white" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }} /> : <div className="absolute inset-0" style={{ backgroundColor: color }} />}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-gray-900">Design Builder</h1>
          <div className="flex gap-2 ml-4 border-l border-gray-200 pl-4">
            <button onClick={undo} className="p-1.5 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100" title="Undo (Ctrl+Z)"><Undo size={18} /></button>
            <button onClick={redo} className="p-1.5 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100" title="Redo (Ctrl+Y)"><Redo size={18} /></button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPNG} className="flex items-center gap-2 rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-200"><Download size={16} /> PNG</button>
          <button onClick={exportPDF} className="flex items-center gap-2 rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-black"><Download size={16} /> PDF</button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-gray-200 bg-white p-4 overflow-y-auto flex flex-col gap-6 scrollbar-hide">
          {lead && (
            <section className="bg-blue-50 -mx-4 -mt-4 p-4 border-b border-blue-100 mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-800 mb-3 flex items-center gap-1.5"><Database size={14} /> CRM Context</h2>
              <div className="text-sm text-blue-900 mb-3">
                <div className="font-medium">{lead.name}</div>
                <div className="text-blue-700">{lead.company}</div>
                <div className="text-blue-700 text-xs mt-1 truncate">{lead.email}</div>
              </div>
              <button onClick={injectLeadData} className="w-full bg-blue-600 text-white text-sm font-medium rounded-md py-1.5 hover:bg-blue-700 transition-colors">Inject Lead Data</button>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Text & Media</h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addElement({ type: 'text', x: 50, y: 50, text: 'Heading', fontSize: 32, fill: '#111827', fontFamily: 'Inter' })} className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                <Type size={20} className="text-gray-600" /><span className="text-xs font-medium text-gray-700">Text</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                <ImageIcon size={20} className="text-gray-600" /><span className="text-xs font-medium text-gray-700">Image</span>
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Lines & Shapes</h2>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => addElement({ type: 'line', x: 50, y: 50, points: [0, 0, 150, 0], stroke: '#111827', strokeWidth: 4 })} className="flex flex-col items-center justify-center gap-1 rounded-md border border-gray-200 p-2 hover:bg-gray-50" title="Line (L)">
                <Minus size={20} className="text-gray-600" /><span className="text-[10px] font-medium text-gray-700">Line</span>
              </button>
              <button onClick={() => addElement({ type: 'arrow', x: 50, y: 50, points: [0, 0, 150, 0], stroke: '#111827', strokeWidth: 4 })} className="flex flex-col items-center justify-center gap-1 rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                <MoveRight size={20} className="text-gray-600" /><span className="text-[10px] font-medium text-gray-700">Arrow</span>
              </button>
              <button onClick={() => addElement({ type: 'rect', x: 100, y: 100, width: 100, height: 100, fill: '#3b82f6', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-md border border-gray-200 p-2 hover:bg-gray-50" title="Rectangle (R)">
                <Square size={20} className="text-gray-600" /><span className="text-[10px] font-medium text-gray-700">Rect</span>
              </button>
              <button onClick={() => addElement({ type: 'circle', x: 150, y: 150, radius: 50, fill: '#ef4444', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-md border border-gray-200 p-2 hover:bg-gray-50" title="Circle (C)">
                <CircleIcon size={20} className="text-gray-600" /><span className="text-[10px] font-medium text-gray-700">Circle</span>
              </button>
              <button onClick={() => addElement({ type: 'polygon', x: 150, y: 150, radius: 50, sides: 3, fill: '#10b981', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                <Triangle size={20} className="text-gray-600" /><span className="text-[10px] font-medium text-gray-700">Triangle</span>
              </button>
              <button onClick={() => addElement({ type: 'star', x: 150, y: 150, radius: 60, sides: 5, fill: '#f59e0b', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                <Star size={20} className="text-gray-600" /><span className="text-[10px] font-medium text-gray-700">Star</span>
              </button>
              <button onClick={() => addElement({ type: 'heart', x: 100, y: 100, scaleX: 1, scaleY: 1, fill: '#ef4444', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                <Heart size={20} className="text-gray-600" /><span className="text-[10px] font-medium text-gray-700">Heart</span>
              </button>
              <button onClick={() => addElement({ type: 'polygon', x: 150, y: 150, radius: 50, sides: 6, fill: '#6366f1', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                <Hexagon size={20} className="text-gray-600" /><span className="text-[10px] font-medium text-gray-700">Hexagon</span>
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5"><QrCode size={14} /> QR Generator</h2>
            <div className="flex flex-col gap-2">
              <input type="text" placeholder="Enter URL or Text" value={qrText} onChange={(e) => setQrText(e.target.value)} className="text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              <button onClick={handleGenerateQR} disabled={!qrText.trim()} className="bg-gray-900 text-white text-sm font-medium rounded-md py-1.5 disabled:opacity-50 hover:bg-gray-800 transition-colors">Generate & Add</button>
            </div>
          </section>
        </aside>
        
        <main className="flex-1 overflow-auto p-8 flex flex-col items-center">
          {children}
        </main>
        
        <aside className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto flex flex-col gap-6">
          {!selectedElement ? (
            <div className="text-sm text-gray-400 italic mt-4 text-center">Select an element to edit properties</div>
          ) : (
            <>
              {/* LAYOUT SECTION */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Layout & Position</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">X</label>
                    <input type="number" value={Math.round(selectedElement.x)} onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-gray-900" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Y</label>
                    <input type="number" value={Math.round(selectedElement.y)} onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-gray-900" />
                  </div>
                  
                  {['rect', 'circle', 'text', 'image'].includes(selectedElement.type) && (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Width</label>
                        <input type="number" value={Math.round(selectedElement.width || (selectedElement.radius ? selectedElement.radius * 2 : 0))} onChange={(e) => {
                          if (selectedElement.type === 'circle') updateElement(selectedElement.id, { radius: parseInt(e.target.value)/2 });
                          else updateElement(selectedElement.id, { width: parseInt(e.target.value) });
                        }} className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-gray-900" />
                      </div>
                    </>
                  )}
                  {selectedElement.type !== 'text' && selectedElement.type !== 'image' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">Rotation</label>
                      <input type="number" value={Math.round(selectedElement.rotation || 0)} onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-gray-900" />
                    </div>
                  )}
                </div>
              </section>

              {/* APPEARANCE SECTION */}
              <section className="border-t border-gray-100 pt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Appearance</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700 flex justify-between">
                      Opacity <span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                    </label>
                    <input type="range" min="0" max="100" value={(selectedElement.opacity ?? 1) * 100} onChange={(e) => updateElement(selectedElement.id, { opacity: parseInt(e.target.value)/100 })} className="w-full accent-gray-900" />
                  </div>
                  
                  {selectedElement.type !== 'image' && selectedElement.type !== 'line' && selectedElement.type !== 'arrow' && (
                    <>
                      {renderColorPicker('Fill Color', 'fill')}
                    </>
                  )}
                  
                  {['rect', 'circle', 'star', 'polygon', 'heart', 'line', 'arrow'].includes(selectedElement.type) && (
                    <div className="mt-2 space-y-4">
                      {renderColorPicker('Stroke Color', 'stroke')}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700 flex justify-between">
                          Stroke Width <span>{selectedElement.strokeWidth || 0}px</span>
                        </label>
                        <input type="range" min="0" max="20" value={selectedElement.strokeWidth || 0} onChange={(e) => updateElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) })} className="w-full accent-gray-900" />
                      </div>
                      
                      {['line', 'arrow'].includes(selectedElement.type) && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-700">Line Style</label>
                          <select 
                            value={selectedElement.dash ? 'dashed' : 'solid'} 
                            onChange={(e) => updateElement(selectedElement.id, { dash: e.target.value === 'dashed' ? [10, 10] : undefined })}
                            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-gray-900"
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* TYPOGRAPHY SECTION */}
              {selectedElement.type === 'text' && (
                <section className="border-t border-gray-100 pt-5">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Typography</h2>
                  <div className="flex flex-col gap-4">
                    
                    <textarea 
                      value={selectedElement.text || ''} 
                      onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                      className="text-sm border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-gray-900 min-h-[60px]"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Font</label>
                        <select 
                          value={selectedElement.fontFamily || 'Arial'} 
                          onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                          className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-gray-900"
                        >
                          {FONTS.map(font => <option key={font} value={font}>{font}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Size</label>
                        <input type="number" value={selectedElement.fontSize || 32} onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-gray-900" />
                      </div>
                    </div>

                    <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
                      <button onClick={() => toggleFontStyle('bold')} className={`p-1.5 rounded flex-1 flex justify-center ${(selectedElement.fontStyle || '').includes('bold') ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}><Bold size={14} /></button>
                      <button onClick={() => toggleFontStyle('italic')} className={`p-1.5 rounded flex-1 flex justify-center ${(selectedElement.fontStyle || '').includes('italic') ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}><Italic size={14} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'underline' ? '' : 'underline' })} className={`p-1.5 rounded flex-1 flex justify-center ${selectedElement.textDecoration === 'underline' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}><Underline size={14} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'line-through' ? '' : 'line-through' })} className={`p-1.5 rounded flex-1 flex justify-center ${selectedElement.textDecoration === 'line-through' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}><Strikethrough size={14} /></button>
                    </div>

                    <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
                      <button onClick={() => updateElement(selectedElement.id, { align: 'left' })} className={`p-1.5 rounded flex-1 flex justify-center ${(!selectedElement.align || selectedElement.align === 'left') ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}><AlignLeft size={14} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { align: 'center' })} className={`p-1.5 rounded flex-1 flex justify-center ${selectedElement.align === 'center' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}><AlignCenter size={14} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { align: 'right' })} className={`p-1.5 rounded flex-1 flex justify-center ${selectedElement.align === 'right' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}><AlignRight size={14} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { align: 'justify' })} className={`p-1.5 rounded flex-1 flex justify-center ${selectedElement.align === 'justify' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}><AlignJustify size={14} /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Letter Spacing</label>
                        <input type="number" step="0.5" value={selectedElement.letterSpacing || 0} onChange={(e) => updateElement(selectedElement.id, { letterSpacing: parseFloat(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-gray-900" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Line Height</label>
                        <input type="number" step="0.1" value={selectedElement.lineHeight || 1} onChange={(e) => updateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-gray-900" />
                      </div>
                    </div>

                  </div>
                </section>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
