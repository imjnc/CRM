import { useState, useEffect } from "react"
import { Plus, Trash2, Edit } from "lucide-react"

interface ProductItem {
  id: string;
  image?: string;
  name: string;
  description: string;
  qty: number;
  sellingPrice: number;
  discount: number;
  tax: number;
}

export function ProductsTab({
  products,
  onProductsChanged,
}: {
  products: ProductItem[];
  onProductsChanged: (products: ProductItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      name: "New Product",
      description: "",
      qty: 1,
      sellingPrice: 0,
      discount: 0,
      tax: 0,
    };
    onProductsChanged([...products, newProduct]);
    setEditingId(newProduct.id);
  };

  const handleUpdateProduct = (id: string, updates: Partial<ProductItem>) => {
    onProductsChanged(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleRemoveProduct = (id: string) => {
    onProductsChanged(products.filter(p => p.id !== id));
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-900">Products & Services</h3>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-1 bg-gray-900 text-white text-[12px] px-3 py-1.5 rounded-md hover:bg-gray-800"
        >
          <Plus size={12} /> Add Product
        </button>
      </div>

      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 bg-slate-50 border border-slate-200 rounded-lg border-dashed">
            <p className="text-[13px] text-slate-500">No products added</p>
            <button type="button" onClick={handleAddProduct} className="text-[12px] text-slate-400 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-white transition-colors">
              Add First Product
            </button>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              {editingId === product.id ? (
                <EditProductForm
                  initialProduct={product}
                  onSave={(updates) => {
                    handleUpdateProduct(product.id, updates);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-[14px] text-slate-900">{product.name || "Unnamed Product"}</div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(product.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleRemoveProduct(product.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[12px] text-slate-500 whitespace-pre-wrap">{product.description || "No description"}</div>
                    <div className="text-[13px] font-semibold text-slate-900">
                      ₹{((product.qty * product.sellingPrice) - product.discount + product.tax).toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EditProductForm({ 
  initialProduct, 
  onSave, 
  onCancel 
}: { 
  initialProduct: ProductItem, 
  onSave: (p: ProductItem) => void, 
  onCancel: () => void 
}) {
  const [product, setProduct] = useState(initialProduct);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCatalogProducts(data);
      })
      .catch(console.error);
  }, []);

  const matchingProducts = catalogProducts.filter(p => 
    p.name.toLowerCase().includes(product.name.toLowerCase()) && 
    p.name !== product.name
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 relative">
          <label className="block text-[11px] text-slate-500 font-medium mb-1">Name</label>
          <input 
            type="text" 
            value={product.name} 
            onChange={e => {
              setProduct({ ...product, name: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoFocus
            className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 bg-white"
          />
          {showSuggestions && matchingProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {matchingProducts.map(p => (
                <button
                  key={p.id}
                  className="w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50 border-b border-slate-50 last:border-0"
                  onClick={() => {
                    setProduct({
                      ...product,
                      name: p.name,
                      description: p.description || "",
                      sellingPrice: p.sellingPrice || 0,
                      tax: p.tax || 0,
                    });
                    setShowSuggestions(false);
                  }}
                >
                  <div className="font-medium text-slate-900">{p.name}</div>
                  <div className="text-[11px] text-slate-500 flex gap-2">
                    <span>₹{p.sellingPrice?.toLocaleString()}</span>
                    {p.sku && <span>• SKU: {p.sku}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] text-slate-500 font-medium mb-1">Description</label>
          <textarea 
            value={product.description} 
            onChange={e => setProduct({ ...product, description: e.target.value })}
            className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 resize-none bg-white"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 font-medium mb-1">Quantity</label>
          <input 
            type="number" 
            value={product.qty} 
            onChange={e => setProduct({ ...product, qty: parseFloat(e.target.value) || 0 })}
            className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 font-medium mb-1">Selling Price (₹)</label>
          <input 
            type="number" 
            value={product.sellingPrice} 
            onChange={e => setProduct({ ...product, sellingPrice: parseFloat(e.target.value) || 0 })}
            className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 font-medium mb-1">Discount (₹)</label>
          <input 
            type="number" 
            value={product.discount} 
            onChange={e => setProduct({ ...product, discount: parseFloat(e.target.value) || 0 })}
            className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 font-medium mb-1">Tax (₹)</label>
          <input 
            type="number" 
            value={product.tax} 
            onChange={e => setProduct({ ...product, tax: parseFloat(e.target.value) || 0 })}
            className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 bg-white"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button 
          onClick={onCancel}
          className="text-[13px] px-3 py-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave(product)}
          className="text-[13px] px-4 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          Save Details
        </button>
      </div>
    </div>
  );
}
