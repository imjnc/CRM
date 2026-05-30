"use client"

import BuilderLayout from "@/components/builder/BuilderLayout";
import dynamic from "next/dynamic";
import { useEffect, useState, use } from "react";

const CanvasArea = dynamic(() => import("@/components/builder/CanvasArea"), { ssr: false });

export default function LeadBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<any>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    fetch(`/api/leads/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => setLead(data))
      .catch(console.error);
  }, [resolvedParams.id]);

  return (
    <BuilderLayout lead={lead}>
      <div className="flex h-full items-center justify-center">
        <div className="bg-white shadow-lg ring-1 ring-gray-200">
          <CanvasArea />
        </div>
      </div>
    </BuilderLayout>
  )
}
