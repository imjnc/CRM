"use client";

import { Stage, Layer, Rect, Text } from "react-konva";
import { useEffect, useState } from "react";

export default function CanvasArea() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Stage width={800} height={600}>
      <Layer>
        <Rect width={800} height={600} fill="#ffffff" />
        <Text text="Hello Lead Data" x={50} y={50} fontSize={24} fill="#111827" />
        <Rect x={50} y={100} width={100} height={100} fill="#111827" cornerRadius={8} />
      </Layer>
    </Stage>
  );
}
