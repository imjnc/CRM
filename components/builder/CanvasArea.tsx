"use client";

import { Stage, Layer, Rect, Circle, Text, Transformer } from "react-konva";
import { useEffect, useState, useRef } from "react";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";

export default function CanvasArea() {
  const [mounted, setMounted] = useState(false);
  const { elements, selectedId, selectElement, updateElement } = useBuilderStore();
  const trRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, elements]);

  if (!mounted) return null;

  return (
    <Stage 
      width={800} 
      height={600} 
      ref={stageRef}
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
          if (el.type === 'text') return <Text {...commonProps} text={el.text} fontSize={el.fontSize} />;
          return null;
        })}
        
        {selectedId && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox} />}
      </Layer>
    </Stage>
  );
}
