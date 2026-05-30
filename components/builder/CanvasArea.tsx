"use client";

import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Transformer } from "react-konva";
import { useEffect, useState, useRef } from "react";
import useImage from "use-image";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";
import { Copy, ClipboardPaste, CopyPlus, Trash2, ArrowUpToLine, ArrowDownToLine, AlignLeft, AlignCenter, AlignRight, AlignVerticalSpaceAround, AlignVerticalSpaceBetween, AlignHorizontalSpaceAround } from "lucide-react";

const URLImage = ({ image, ...props }: any) => {
  const [img] = useImage(image.src);
  return <KonvaImage image={img} {...props} />;
};

export default function CanvasArea() {
  const [mounted, setMounted] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  
  const { 
    elements, 
    selectedId, 
    selectElement, 
    updateElement, 
    removeElement, 
    duplicateElement,
    setStageRef,
    undo,
    redo,
    copyElement,
    pasteElement,
    bringToFront,
    sendToBack
  } = useBuilderStore();
  
  const trRef = useRef<any>(null);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (stageRef.current) {
      setStageRef(stageRef.current);
    }
  }, [stageRef, setStageRef]);

  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, elements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      // Copy / Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        copyElement();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        pasteElement();
      }

      // Delete / Duplicate
      if (!selectedId) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        removeElement(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateElement(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, removeElement, duplicateElement, undo, redo, copyElement, pasteElement]);

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
    if (e.target === e.target.getStage() || e.target.id() === 'bg') {
      setContextMenu({ visible: false, x: 0, y: 0 });
      return;
    }
    
    // Select the element being right-clicked
    if (e.target.id()) {
      selectElement(e.target.id());
    }

    // Get position relative to container
    if (containerRef.current) {
      const stageBox = containerRef.current.getBoundingClientRect();
      setContextMenu({
        visible: true,
        x: e.evt.clientX - stageBox.left,
        y: e.evt.clientY - stageBox.top
      });
    }
  };

  const closeMenu = () => setContextMenu({ ...contextMenu, visible: false });

  const alignElement = (type: string) => {
    if (!selectedId) return;
    const node = stageRef.current?.findOne(`#${selectedId}`);
    if (!node) return;

    const width = node.width() * node.scaleX();
    const height = node.height() * node.scaleY();
    
    const updates: any = {};
    if (type === 'left') updates.x = 0;
    if (type === 'center') updates.x = 400 - (width / 2);
    if (type === 'right') updates.x = 800 - width;
    if (type === 'top') updates.y = 0;
    if (type === 'middle') updates.y = 300 - (height / 2);
    if (type === 'bottom') updates.y = 600 - height;
    
    updateElement(selectedId, updates);
    closeMenu();
  };

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="relative select-none">
      <Stage 
        width={800} 
        height={600} 
        ref={stageRef}
        onContextMenu={handleContextMenu}
        onClick={() => {
          closeMenu();
        }}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage() || e.target.id() === 'bg') {
            selectElement(null);
          }
        }}
      >
        <Layer>
          <Rect id="bg" width={800} height={600} fill="#ffffff" />
          
          {elements.map((el) => {
            const commonProps = {
              key: el.id,
              id: el.id,
              x: el.x,
              y: el.y,
              fill: el.fill,
              opacity: el.opacity ?? 1,
              rotation: el.rotation ?? 0,
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
                  rotation: node.rotation(),
                  width: el.type !== 'circle' ? node.width() * node.scaleX() : undefined,
                  height: el.type !== 'circle' ? node.height() * node.scaleY() : undefined,
                  radius: el.type === 'circle' ? node.radius() * node.scaleX() : undefined,
                });
                node.scaleX(1);
                node.scaleY(1);
              }
            };

            if (el.type === 'rect') return <Rect {...commonProps} width={el.width} height={el.height} />;
            if (el.type === 'circle') return <Circle {...commonProps} radius={el.radius} />;
            if (el.type === 'text') return (
              <Text 
                {...commonProps} 
                text={el.text} 
                fontSize={el.fontSize} 
                fontFamily={el.fontFamily || 'Arial'}
                fontStyle={el.fontStyle || 'normal'}
                textDecoration={el.textDecoration || ''}
                align={el.align || 'left'}
                letterSpacing={el.letterSpacing || 0}
                lineHeight={el.lineHeight || 1}
              />
            );
            if (el.type === 'image') return <URLImage image={el} {...commonProps} width={el.width} height={el.height} />;
            return null;
          })}
          
          {selectedId && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox} />}
        </Layer>
      </Stage>

      {/* Context Menu Overlay */}
      {contextMenu.visible && selectedId && (
        <div 
          className="absolute z-50 w-48 bg-white rounded-md shadow-xl border border-gray-200 py-1 text-sm font-medium text-gray-700"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button className="flex w-full items-center px-4 py-2 hover:bg-gray-100" onClick={() => { copyElement(); closeMenu(); }}>
            <Copy size={14} className="mr-2" /> Copy
          </button>
          <button className="flex w-full items-center px-4 py-2 hover:bg-gray-100" onClick={() => { pasteElement(); closeMenu(); }}>
            <ClipboardPaste size={14} className="mr-2" /> Paste
          </button>
          <button className="flex w-full items-center px-4 py-2 hover:bg-gray-100" onClick={() => { duplicateElement(selectedId); closeMenu(); }}>
            <CopyPlus size={14} className="mr-2" /> Duplicate
          </button>
          <button className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-red-50" onClick={() => { removeElement(selectedId); closeMenu(); }}>
            <Trash2 size={14} className="mr-2" /> Delete
          </button>
          
          <div className="my-1 border-t border-gray-200"></div>
          
          <button className="flex w-full items-center px-4 py-2 hover:bg-gray-100" onClick={() => { bringToFront(selectedId); closeMenu(); }}>
            <ArrowUpToLine size={14} className="mr-2" /> Bring to Front
          </button>
          <button className="flex w-full items-center px-4 py-2 hover:bg-gray-100" onClick={() => { sendToBack(selectedId); closeMenu(); }}>
            <ArrowDownToLine size={14} className="mr-2" /> Send to Back
          </button>

          <div className="my-1 border-t border-gray-200"></div>

          <div className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider">Align to Page</div>
          <div className="grid grid-cols-3 gap-1 px-2 pb-1">
            <button className="p-1.5 hover:bg-gray-100 rounded flex justify-center" title="Align Left" onClick={() => alignElement('left')}><AlignLeft size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded flex justify-center" title="Align Center" onClick={() => alignElement('center')}><AlignCenter size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded flex justify-center" title="Align Right" onClick={() => alignElement('right')}><AlignRight size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded flex justify-center" title="Align Top" onClick={() => alignElement('top')}><ArrowUpToLine size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded flex justify-center" title="Align Middle" onClick={() => alignElement('middle')}><AlignVerticalSpaceAround size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded flex justify-center" title="Align Bottom" onClick={() => alignElement('bottom')}><ArrowDownToLine size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
