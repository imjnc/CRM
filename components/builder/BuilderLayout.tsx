"use client";

import { Type, Square, Circle as CircleIcon, Image as ImageIcon, QrCode, Download, Database, Undo, Redo } from "lucide-react";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";
import { useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

const BRAND_COLORS = [
  '#111827', // Slate 900
  '#3b82f6', // Blue 500
  '#ef4444', // Red 500
  '#10b981', // Emerald 500
  '#f59e0b', // Amber 500
  '#6366f1', // Indigo 500
];

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
        addElement({ 
          type: 'image', 
          x: 50, 
          y: 50, 
          width: 200, 
          height: 200, 
          src: reader.result as string 
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerateQR = async () => {
    if (!qrText.trim()) return;
    try {
      const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1 });
      addElement({
        type: 'image',
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        src: qrDataUrl
      });
      setQrText("");
    } catch (err) {
      console.error("Failed to generate QR code", err);
    }
  };

  const exportPNG = () => {
    if (!stageRef) return;
    selectElement(null); // deselect before export to hide transformer
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
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [800, 600]
      });
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-gray-900">Design Builder</h1>
          <div className="flex gap-2 ml-4 border-l border-gray-200 pl-4">
            <button onClick={undo} className="p-1.5 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100" title="Undo (Ctrl+Z)">
              <Undo size={18} />
            </button>
            <button onClick={redo} className="p-1.5 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100" title="Redo (Ctrl+Y)">
              <Redo size={18} />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPNG} className="flex items-center gap-2 rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-200">
            <Download size={16} /> PNG
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-black">
            <Download size={16} /> PDF
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-gray-200 bg-white p-4 overflow-y-auto flex flex-col gap-6 scrollbar-hide">
          
          {/* CRM Data Section */}
          {lead && (
            <section className="bg-blue-50 -mx-4 -mt-4 p-4 border-b border-blue-100 mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-800 mb-3 flex items-center gap-1.5">
                <Database size={14} />
                CRM Context
              </h2>
              <div className="text-sm text-blue-900 mb-3">
                <div className="font-medium">{lead.name}</div>
                <div className="text-blue-700">{lead.company}</div>
                <div className="text-blue-700 text-xs mt-1 truncate">{lead.email}</div>
              </div>
              <button 
                onClick={injectLeadData}
                className="w-full bg-blue-600 text-white text-sm font-medium rounded-md py-1.5 hover:bg-blue-700 transition-colors"
              >
                Inject Lead Data
              </button>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Add Elements</h2>
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
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50"
              >
                <ImageIcon size={20} className="text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Image</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <QrCode size={14} />
              QR Generator
            </h2>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Enter URL or Text" 
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button 
                onClick={handleGenerateQR}
                disabled={!qrText.trim()}
                className="bg-gray-900 text-white text-sm font-medium rounded-md py-1.5 disabled:opacity-50 hover:bg-gray-800 transition-colors"
              >
                Generate & Add
              </button>
            </div>
          </section>

        </aside>
        
        <main className="flex-1 overflow-auto p-8 flex flex-col items-center">
          {children}
        </main>
        
        <aside className="w-72 border-l border-gray-200 bg-white p-4 overflow-y-auto flex flex-col gap-6">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Properties</h2>
            
            {!selectedElement ? (
              <div className="text-sm text-gray-400 italic">Select an element to edit properties</div>
            ) : (
              <div className="flex flex-col gap-4">
                
                {selectedElement.type === 'text' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">Text Content</label>
                      <input 
                        type="text" 
                        value={selectedElement.text || ''} 
                        onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                        className="text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">Font Size</label>
                      <input 
                        type="number" 
                        value={selectedElement.fontSize || 32} 
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                        className="text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </>
                )}

                {['rect', 'circle', 'text'].includes(selectedElement.type) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={selectedElement.fill || '#000000'} 
                        onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-sm text-gray-600 font-mono uppercase">
                        {selectedElement.fill || '#000000'}
                      </span>
                    </div>
                  </div>
                )}
                
                {['rect', 'circle', 'text'].includes(selectedElement.type) && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <label className="text-xs font-medium text-gray-700 block mb-2">Brand Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => updateElement(selectedElement.id, { fill: color })}
                          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedElement.type === 'image' && (
                  <div className="text-sm text-gray-500">
                    Resize this image using the corner handles on the canvas.
                  </div>
                )}

              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
