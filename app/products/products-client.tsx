"use client"

import { useState } from "react"
import { Package, Plus, Search, Edit2, Trash2 } from "lucide-react"
import { ProductModal } from "./product-modal"

type Product = {
  id: string
  name: string
  sku: string | null
  description: string | null
  sellingPrice: number
  purchasePrice: number
  tax: number
  status: string
}

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSaveProduct = async (product: Partial<Product>) => {
    if (editingProduct) {
      // Update
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
      if (res.ok) {
        const updated = await res.json()
        setProducts(products.map(p => p.id === updated.id ? updated : p))
      }
    } else {
      // Create
      const res = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
      if (res.ok) {
        const created = await res.json()
        setProducts([created, ...products])
      }
    }
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (res.ok) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 gap-4">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Package className="text-gray-500" />
          Products & Catalog
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null)
            setIsModalOpen(true)
          }}
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      <div className="p-6 overflow-y-auto">
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-x-auto w-full">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">Purchase Price</th>
                <th className="px-4 py-3">Tax</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm text-gray-900">{product.name}</div>
                    {product.description && <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.sku || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">₹{product.sellingPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">₹{product.purchasePrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">₹{product.tax.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => {
                        setEditingProduct(product)
                        setIsModalOpen(true)
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded mr-1"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">
                    No products found. Add a new product to your catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(null)
          }} 
          onSave={handleSaveProduct} 
        />
      )}
    </div>
  )
}
