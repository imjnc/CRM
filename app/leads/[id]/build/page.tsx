"use client"

import BuilderLayout from "@/components/builder/BuilderLayout";
import dynamic from "next/dynamic";
import { useEffect, useState, use } from "react";

const CanvasArea = dynamic(() => import("@/components/builder/CanvasArea"), { ssr: false });

export default function LeadBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<any>(null);
  const [productsCatalog, setProductsCatalog] = useState<any[]>([]);
  const resolvedParams = use(params);

  useEffect(() => {
    Promise.all([
      fetch(`/api/leads/${resolvedParams.id}`).then(res => res.json()),
      fetch(`/api/products`).then(res => res.json())
    ])
      .then(([leadData, productsData]) => {
        setLead(leadData);
        setProductsCatalog(productsData.products || []);
      })
      .catch(console.error);
  }, [resolvedParams.id]);

  return (
    <BuilderLayout lead={lead} productsCatalog={productsCatalog}>
      <CanvasArea lead={lead} productsCatalog={productsCatalog} />
    </BuilderLayout>
  )
}
