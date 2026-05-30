"use client"

import BuilderLayout from "@/components/builder/BuilderLayout";
import dynamic from "next/dynamic";

const CanvasArea = dynamic(() => import("@/components/builder/CanvasArea"), { ssr: false });

export default function LeadBuilderPage({ params }: { params: { id: string } }) {
  return (
    <BuilderLayout>
      <div className="flex h-full items-center justify-center">
        <div className="bg-white shadow-lg ring-1 ring-gray-200">
          <CanvasArea />
        </div>
      </div>
    </BuilderLayout>
  )
}
