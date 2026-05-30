"use client";

import { Type, Square, Circle as CircleIcon, Image as ImageIcon, QrCode, Download, Database, Undo, Redo, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Star, Heart, Minus, MoveRight, Hexagon, Triangle, AppWindow, BarChart3, Plus, Trash2 } from "lucide-react";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";
import { useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { HexColorPicker } from "react-colorful";

const BRAND_COLORS = [
  '#111827', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#ffffff', 'transparent'
];

const FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Oswald', 'Playfair Display', 'Merriweather', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Comic Sans MS'];

const DEFAULT_CHART_DATA = [
  { name: 'Q1', value: 400 },
  { name: 'Q2', value: 300 },
  { name: 'Q3', value: 200 },
  { name: 'Q4', value: 278 }
];

export default function BuilderLayout({ children, lead }: { children: React.ReactNode, lead?: any }) {
  const { addElement, elements, selectedId, updateElement, stageRef, undo, redo, selectElement } = useBuilderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrText, setQrText] = useState("");
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

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
    const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
    if (fullName) addElement({ type: 'text', x: 50, y: yStart, text: fullName, fontSize: 32, fill: '#111827' });
    if (lead.email) addElement({ type: 'text', x: 50, y: yStart + 40, text: lead.email, fontSize: 20, fill: '#4b5563' });
    if (lead.organization?.name) addElement({ type: 'text', x: 50, y: yStart + 70, text: lead.organization.name, fontSize: 24, fill: '#3b82f6' });
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
      <div className="flex flex-col gap-1.5 mt-2 relative">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <div 
            onClick={() => setActiveColorPicker(activeColorPicker === field ? null : field)}
            className="h-8 w-8 rounded cursor-pointer border border-gray-200 shadow-sm relative overflow-hidden flex-shrink-0"
          >
            {value === 'transparent' ? <div className="absolute inset-0 bg-white" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }} /> : <div className="absolute inset-0" style={{ backgroundColor: value }} />}
          </div>
          <input type="text" value={value} onChange={(e) => updateElement(selectedElement.id, { [field]: e.target.value })} className="text-sm border border-gray-200 rounded-md px-2 py-1.5 w-full focus:ring-1 focus:ring-black font-mono" placeholder="#000000" />
        </div>
        
        {activeColorPicker === field && (
          <div className="absolute top-16 left-0 z-50 bg-white p-3 rounded-lg shadow-xl border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
               <span className="text-xs font-medium text-gray-700">Custom Color</span>
               <button onClick={() => setActiveColorPicker(null)} className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-gray-900 font-medium bg-gray-100 px-2 py-1 rounded">Close</button>
            </div>
            <HexColorPicker color={value === 'transparent' ? '#ffffff' : value} onChange={(color) => updateElement(selectedElement.id, { [field]: color })} />
            <div className="flex flex-wrap gap-2 mt-1 w-[200px]">
              {BRAND_COLORS.map(color => (
                <button key={color} onClick={() => { updateElement(selectedElement.id, { [field]: color }); setActiveColorPicker(null); }} className="w-5 h-5 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 flex items-center justify-center relative overflow-hidden" title={color}>
                  {color === 'transparent' ? <div className="absolute inset-0 bg-white" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }} /> : <div className="absolute inset-0" style={{ backgroundColor: color }} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Type size={18} className="text-white" />
            </div>
            <h1 className="font-semibold text-gray-900 tracking-tight">Design Builder</h1>
          </div>
          <div className="flex gap-1 ml-4 border-l border-gray-200 pl-4">
            <button onClick={undo} className="p-1.5 text-gray-500 hover:text-black rounded hover:bg-gray-50 transition-colors" title="Undo (Ctrl+Z)"><Undo size={18} /></button>
            <button onClick={redo} className="p-1.5 text-gray-500 hover:text-black rounded hover:bg-gray-50 transition-colors" title="Redo (Ctrl+Y)"><Redo size={18} /></button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPNG} className="flex items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"><Download size={16} /> PNG</button>
          <button onClick={exportPDF} className="flex items-center gap-2 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"><Download size={16} /> PDF</button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="shrink-0 w-72 border-r border-gray-200 bg-white p-4 overflow-y-auto flex flex-col gap-6 scrollbar-hide shadow-sm z-10">
          {lead && (
            <section className="bg-gray-50 -mx-4 -mt-4 p-4 border-b border-gray-100 mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-1.5"><Database size={14} /> CRM Context</h2>
              <div className="text-sm text-black mb-3">
                <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                <div className="text-gray-800">{lead.organization?.name}</div>
                <div className="text-gray-800 text-xs mt-1 truncate">{lead.email}</div>
              </div>
              <button onClick={injectLeadData} className="w-full bg-black text-white text-sm font-medium rounded-md py-1.5 hover:bg-gray-800 transition-colors shadow-sm">Inject Lead Data</button>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Text & Media</h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addElement({ type: 'text', x: 50, y: 50, text: 'Heading', fontSize: 32, fill: '#111827', fontFamily: 'Inter' })} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-800 transition-all group">
                <Type size={20} className="text-gray-500 group-hover:text-black transition-colors" /><span className="text-xs font-medium text-gray-700 group-hover:text-gray-800 transition-colors">Text</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-800 transition-all group">
                <ImageIcon size={20} className="text-gray-500 group-hover:text-black transition-colors" /><span className="text-xs font-medium text-gray-700 group-hover:text-gray-800 transition-colors">Image</span>
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Lines & Shapes</h2>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => addElement({ type: 'line', x: 50, y: 50, points: [0, 0, 150, 0], stroke: '#111827', strokeWidth: 4 })} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 hover:border-gray-200 transition-all group" title="Line (L)">
                <Minus size={20} className="text-gray-500 group-hover:text-black" /><span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-800">Line</span>
              </button>
              <button onClick={() => addElement({ type: 'arrow', x: 50, y: 50, points: [0, 0, 150, 0], stroke: '#111827', strokeWidth: 4 })} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <MoveRight size={20} className="text-gray-500 group-hover:text-black" /><span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-800">Arrow</span>
              </button>
              <button onClick={() => addElement({ type: 'rect', x: 100, y: 100, width: 100, height: 100, fill: '#3b82f6', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 hover:border-gray-200 transition-all group" title="Rectangle (R)">
                <Square size={20} className="text-gray-500 group-hover:text-black" /><span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-800">Rect</span>
              </button>
              <button onClick={() => addElement({ type: 'circle', x: 150, y: 150, radius: 50, fill: '#ef4444', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 hover:border-gray-200 transition-all group" title="Circle (C)">
                <CircleIcon size={20} className="text-gray-500 group-hover:text-black" /><span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-800">Circle</span>
              </button>
              <button onClick={() => addElement({ type: 'polygon', x: 150, y: 150, radius: 50, sides: 3, fill: '#10b981', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <Triangle size={20} className="text-gray-500 group-hover:text-black" /><span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-800">Triangle</span>
              </button>
              <button onClick={() => addElement({ type: 'star', x: 150, y: 150, radius: 60, sides: 5, fill: '#f59e0b', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <Star size={20} className="text-gray-500 group-hover:text-black" /><span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-800">Star</span>
              </button>
              <button onClick={() => addElement({ type: 'heart', x: 100, y: 100, scaleX: 1, scaleY: 1, fill: '#ef4444', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <Heart size={20} className="text-gray-500 group-hover:text-black" /><span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-800">Heart</span>
              </button>
              <button onClick={() => addElement({ type: 'polygon', x: 150, y: 150, radius: 50, sides: 6, fill: '#6366f1', strokeWidth: 0, stroke: 'transparent' })} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <Hexagon size={20} className="text-gray-500 group-hover:text-black" /><span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-800">Hexagon</span>
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5"><AppWindow size={14} /> Interactive Media</h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addElement({ type: 'embed', x: 50, y: 50, width: 400, height: 300, embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' })} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 hover:border-gray-400 transition-all group">
                <AppWindow size={20} className="text-black" /><span className="text-xs font-medium text-black text-center">Live Embed</span>
              </button>
              <button onClick={() => addElement({ type: 'chart', x: 50, y: 50, width: 400, height: 300, chartType: 'bar', chartData: DEFAULT_CHART_DATA })} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 hover:border-gray-400 transition-all group">
                <BarChart3 size={20} className="text-black" /><span className="text-xs font-medium text-black text-center">Data Chart</span>
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5"><QrCode size={14} /> QR Generator</h2>
            <div className="flex flex-col gap-2">
              <input type="text" placeholder="Enter URL or Text" value={qrText} onChange={(e) => setQrText(e.target.value)} className="text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-black" />
              <button onClick={handleGenerateQR} disabled={!qrText.trim()} className="bg-gray-900 text-white text-sm font-medium rounded-md py-1.5 disabled:opacity-50 hover:bg-gray-800 transition-colors shadow-sm">Generate & Add</button>
            </div>
          </section>
        </aside>
        
        <main className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center bg-gray-100/50">
          <div className="bg-white shadow-lg shadow-gray-200/50 ring-1 ring-gray-200" style={{ width: 800, height: 600 }}>
            {children}
          </div>
        </main>
        
        <aside className="shrink-0 w-80 border-l border-gray-200 bg-white p-5 overflow-y-auto flex flex-col gap-6 shadow-sm z-10">
          {!selectedElement ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
               <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                 <Type size={20} className="text-gray-300" />
               </div>
               <div className="text-sm text-gray-400 font-medium">Select an element to edit properties</div>
            </div>
          ) : (
            <>
              {/* MEDIA & CHART SPECIFIC CONTROLS */}
              {selectedElement.type === 'embed' && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-3">Live Embed Settings</h2>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 font-medium">Iframe URL</label>
                    <input 
                      type="text" 
                      value={selectedElement.embedUrl || ''} 
                      onChange={(e) => updateElement(selectedElement.id, { embedUrl: e.target.value })} 
                      placeholder="https://..."
                      className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black w-full" 
                    />
                    <p className="text-[10px] text-gray-400 leading-tight mt-1">Supports YouTube embeds, Google Forms, Typeform, maps, and document links.</p>
                  </div>
                </section>
              )}

              {selectedElement.type === 'chart' && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-3">Live Chart Data</h2>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-500 font-medium">Chart Type</label>
                      <select 
                        value={selectedElement.chartType || 'bar'} 
                        onChange={(e) => updateElement(selectedElement.id, { chartType: e.target.value as any })}
                        className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black bg-white"
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                      </select>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-3 py-2 flex justify-between items-center border-b border-gray-200">
                        <span className="text-xs font-medium text-gray-700">Data Points</span>
                        <button 
                          onClick={() => {
                            const current = selectedElement.chartData || [];
                            updateElement(selectedElement.id, { chartData: [...current, { name: `Item ${current.length + 1}`, value: 100 }] });
                          }}
                          className="text-black hover:text-gray-800 p-1 hover:bg-gray-100 rounded transition-colors"
                        ><Plus size={14}/></button>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-2 flex flex-col gap-2 bg-white">
                        {(selectedElement.chartData || []).map((row: any, i: number) => (
                          <div key={i} className="flex gap-1.5 items-center">
                            <input type="text" value={row.name} onChange={(e) => {
                              const newData = [...(selectedElement.chartData || [])];
                              newData[i].name = e.target.value;
                              updateElement(selectedElement.id, { chartData: newData });
                            }} className="text-xs border border-gray-200 rounded px-2 py-1.5 w-16 focus:ring-1 focus:ring-black flex-1" />
                            <input type="number" value={row.value} onChange={(e) => {
                              const newData = [...(selectedElement.chartData || [])];
                              newData[i].value = parseInt(e.target.value) || 0;
                              updateElement(selectedElement.id, { chartData: newData });
                            }} className="text-xs border border-gray-200 rounded px-2 py-1.5 w-16 focus:ring-1 focus:ring-black flex-1" />
                            <button onClick={() => {
                              const newData = [...(selectedElement.chartData || [])];
                              newData.splice(i, 1);
                              updateElement(selectedElement.id, { chartData: newData });
                            }} className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* LAYOUT SECTION */}
              <section className={['embed', 'chart'].includes(selectedElement.type) ? "border-t border-gray-100 pt-5" : ""}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Layout & Position</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500 font-medium">X</label>
                    <input type="number" value={Math.round(selectedElement.x)} onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500 font-medium">Y</label>
                    <input type="number" value={Math.round(selectedElement.y)} onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black" />
                  </div>
                  
                  {['rect', 'circle', 'text', 'image', 'embed', 'chart'].includes(selectedElement.type) && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 font-medium">Width</label>
                        <input type="number" value={Math.round(selectedElement.width || (selectedElement.radius ? selectedElement.radius * 2 : 0))} onChange={(e) => {
                          if (selectedElement.type === 'circle') updateElement(selectedElement.id, { radius: parseInt(e.target.value)/2 });
                          else updateElement(selectedElement.id, { width: parseInt(e.target.value) });
                        }} className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black" />
                      </div>
                    </>
                  )}
                  {selectedElement.type !== 'text' && selectedElement.type !== 'image' && selectedElement.type !== 'embed' && selectedElement.type !== 'chart' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-500 font-medium">Rotation</label>
                      <input type="number" value={Math.round(selectedElement.rotation || 0)} onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black" />
                    </div>
                  )}
                </div>
              </section>

              {/* APPEARANCE SECTION */}
              <section className="border-t border-gray-100 pt-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Appearance</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700 flex justify-between">
                      Opacity <span className="text-gray-500">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                    </label>
                    <input type="range" min="0" max="100" value={(selectedElement.opacity ?? 1) * 100} onChange={(e) => updateElement(selectedElement.id, { opacity: parseInt(e.target.value)/100 })} className="w-full accent-black" />
                  </div>
                  
                  {selectedElement.type !== 'image' && selectedElement.type !== 'line' && selectedElement.type !== 'arrow' && selectedElement.type !== 'embed' && selectedElement.type !== 'chart' && (
                    <>
                      {renderColorPicker('Fill Color', 'fill')}
                    </>
                  )}
                  
                  {['rect', 'circle', 'star', 'polygon', 'heart', 'line', 'arrow'].includes(selectedElement.type) && (
                    <div className="mt-2 space-y-4">
                      {renderColorPicker('Stroke Color', 'stroke')}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-700 flex justify-between">
                          Stroke Width <span className="text-gray-500">{selectedElement.strokeWidth || 0}px</span>
                        </label>
                        <input type="range" min="0" max="20" value={selectedElement.strokeWidth || 0} onChange={(e) => updateElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) })} className="w-full accent-black" />
                      </div>
                      
                      {['line', 'arrow'].includes(selectedElement.type) && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-gray-700">Line Style</label>
                          <select 
                            value={selectedElement.dash ? 'dashed' : 'solid'} 
                            onChange={(e) => updateElement(selectedElement.id, { dash: e.target.value === 'dashed' ? [10, 10] : undefined })}
                            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black bg-white"
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
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Typography</h2>
                  <div className="flex flex-col gap-4">
                    
                    <textarea 
                      value={selectedElement.text || ''} 
                      onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                      className="text-sm border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-black min-h-[80px]"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 font-medium">Font</label>
                        <select 
                          value={selectedElement.fontFamily || 'Inter'} 
                          onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                          className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black bg-white"
                        >
                          {FONTS.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 font-medium">Size</label>
                        <input type="number" value={selectedElement.fontSize || 32} onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black" />
                      </div>
                    </div>

                    <div className="flex gap-1 bg-gray-100/80 p-1 rounded-md border border-gray-200/50">
                      <button onClick={() => toggleFontStyle('bold')} className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${(selectedElement.fontStyle || '').includes('bold') ? 'bg-white shadow-sm border border-gray-200 text-black' : 'hover:bg-gray-200/50 text-gray-600'}`}><Bold size={16} /></button>
                      <button onClick={() => toggleFontStyle('italic')} className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${(selectedElement.fontStyle || '').includes('italic') ? 'bg-white shadow-sm border border-gray-200 text-black' : 'hover:bg-gray-200/50 text-gray-600'}`}><Italic size={16} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'underline' ? '' : 'underline' })} className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${selectedElement.textDecoration === 'underline' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'hover:bg-gray-200/50 text-gray-600'}`}><Underline size={16} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'line-through' ? '' : 'line-through' })} className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${selectedElement.textDecoration === 'line-through' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'hover:bg-gray-200/50 text-gray-600'}`}><Strikethrough size={16} /></button>
                    </div>

                    <div className="flex gap-1 bg-gray-100/80 p-1 rounded-md border border-gray-200/50">
                      <button onClick={() => updateElement(selectedElement.id, { align: 'left' })} className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${(!selectedElement.align || selectedElement.align === 'left') ? 'bg-white shadow-sm border border-gray-200 text-black' : 'hover:bg-gray-200/50 text-gray-600'}`}><AlignLeft size={16} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { align: 'center' })} className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${selectedElement.align === 'center' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'hover:bg-gray-200/50 text-gray-600'}`}><AlignCenter size={16} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { align: 'right' })} className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${selectedElement.align === 'right' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'hover:bg-gray-200/50 text-gray-600'}`}><AlignRight size={16} /></button>
                      <button onClick={() => updateElement(selectedElement.id, { align: 'justify' })} className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${selectedElement.align === 'justify' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'hover:bg-gray-200/50 text-gray-600'}`}><AlignJustify size={16} /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 font-medium">Letter Spacing</label>
                        <input type="number" step="0.5" value={selectedElement.letterSpacing || 0} onChange={(e) => updateElement(selectedElement.id, { letterSpacing: parseFloat(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 font-medium">Line Height</label>
                        <input type="number" step="0.1" value={selectedElement.lineHeight || 1} onChange={(e) => updateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) })} className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-black" />
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
