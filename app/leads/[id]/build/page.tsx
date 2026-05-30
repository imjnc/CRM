"use client"

import BuilderLayout from "@/components/builder/BuilderLayout";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CanvasArea = dynamic(() => import("@/components/builder/CanvasArea"), { ssr: false });

export default function LeadBuilderPage({ params }: { params: { id: string } }) {
  const [lead, setLead] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/leads/${params.id}`)
      .then(res => res.json())
      .then(data => setLead(data))
      .catch(console.error);
  }, [params.id]);

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
