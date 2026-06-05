"use client"

import { useState } from "react"
import { X } from "lucide-react"

export function ProductModal({ product, onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sellingPrice: product?.sellingPrice || 0,
    purchasePrice: product?.purchasePrice || 0,
    tax: product?.tax || 0,
    status: product?.status || "Active",
  })

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{product ? "Edit Product" : "New Product"}</h2>
            {product?.sku && (
              <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
            <input 
              autoFocus
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-gray-900"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-gray-900 resize-none"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price (₹)</label>
              <input 
                type="number"
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-gray-900"
                value={form.sellingPrice}
                onChange={e => setForm({...form, sellingPrice: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Purchase Price (₹)</label>
              <input 
                type="number"
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-gray-900"
                value={form.purchasePrice}
                onChange={e => setForm({...form, purchasePrice: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tax (₹)</label>
              <input 
                type="number"
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-gray-900"
                value={form.tax}
                onChange={e => setForm({...form, tax: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-gray-900 bg-white"
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-md disabled:opacity-50 transition-colors"
          >
            {product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  )
}
