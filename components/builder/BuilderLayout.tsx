"use client";

import { Type, Square, Circle as CircleIcon, Image as ImageIcon, QrCode } from "lucide-react";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";
import { useState, useRef } from "react";
import QRCode from "qrcode";

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const addElement = useBuilderStore((state) => state.addElement);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrText, setQrText] = useState("");

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
    // reset input so same file can be uploaded again if deleted
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-gray-900">Design Builder</h1>
        </div>
        <div className="flex gap-2">
          <button className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-200">Preview</button>
          <button className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-black">Save Design</button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-gray-200 bg-white p-4 overflow-y-auto flex flex-col gap-6">
          
          {/* Elements Section */}
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

          {/* QR Generator Section */}
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
        
        <aside className="w-64 border-l border-gray-200 bg-white p-4 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Properties</h2>
          <div className="text-sm text-gray-400 italic">Select an element to edit properties</div>
        </aside>
      </div>
    </div>
  )
}
