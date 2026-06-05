import React, { useEffect } from 'react';
import { useProposalStore } from '@/lib/stores/useProposalStore';
import QRCode from 'qrcode.react';

const InputNode = ({ value, onChange, className, style, placeholder, maxLength, type = "text" }: any) => (
  <input 
    type={type} 
    value={value} 
    onChange={(e) => {
      const v = e.target.value;
      if (maxLength && v.length > maxLength) return;
      onChange(v);
    }}
    placeholder={placeholder}
    className={`bg-transparent border-none hover:bg-gray-100/50 focus:bg-gray-100/50 focus:ring-1 focus:ring-blue-500 rounded px-1 -mx-1 w-full placeholder:text-gray-300 pointer-events-auto ${className || ''}`}
    style={style}
  />
);

export default function ProposalDocument({ lead, productsCatalog = [] }: { lead: any, productsCatalog?: any[] }) {
  const store = useProposalStore();

  // Initialize with lead data if available
  useEffect(() => {
    if (lead && lead.id) {
      store.updateHeaderInfo({
        name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'John Doe',
        title: lead.jobTitle || 'Senior Director',
        org: lead.organization?.name || 'Acme Corp',
        email: lead.email || 'john.doe@example.com',
        mobile: lead.mobile || ''
      });
      store.updateClientDetails({
        name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'John Doe',
        industry: lead.industry || 'Software',
        status: lead.status || 'Qualified'
      });
      store.updateOrgDetails({
        company: lead.organization?.name || 'Acme Corp',
        email: lead.email || 'contact@acme.com',
        phone: lead.mobile || ''
      });
      store.updateFooterInfo({
        preparedBy: lead.assignedTo?.name || 'Sales Team'
      });
      if (lead.customData?.products && Array.isArray(lead.customData.products) && lead.customData.products.length > 0) {
        store.setProducts(lead.customData.products);
      }
      if (lead.customData?.clientLogo) {
        useProposalStore.setState({ clientLogo: lead.customData.clientLogo });
      }
      if (lead.customData?.logoSettings) {
        store.updateLogoSettings(lead.customData.logoSettings);
      }
    }
  }, [lead?.id]); // Only run when lead.id changes

  const subtotal = store.products.reduce((acc, p) => acc + (p.qty * p.sellingPrice), 0);
  const discountTotal = store.products.reduce((acc, p) => acc + p.discount, 0);
  const taxTotal = store.products.reduce((acc, p) => acc + p.tax, 0);
  const grandTotal = subtotal - discountTotal + taxTotal;

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(store.products.length / ITEMS_PER_PAGE));
  const pages = Array.from({ length: totalPages }).map((_, i) => store.products.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));

  return (
    <div id="proposal-document-container" className="flex flex-col gap-6 bg-transparent items-center">
      {pages.map((pageProducts, pageIndex) => {
        const isLastPage = pageIndex === totalPages - 1;
        return (
          <div 
            key={pageIndex}
            className="proposal-page w-[800px] text-sm flex flex-col shadow-sm relative shrink-0"
            style={{
              fontFamily: store.typography.fontFamily,
              color: store.brandColors.text,
              backgroundColor: store.brandColors.bg,
              minHeight: '1130px',
              padding: '40px',
              boxSizing: 'border-box',
              pageBreakAfter: 'always'
            }}
          >
      {/* ROW 1 */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
        <div>
          {store.clientLogo ? (
            <div 
              className={`overflow-hidden flex items-center justify-center bg-white relative`}
              style={{
                width: `${store.logoSettings.padding * 16}px`,
                height: `${store.logoSettings.padding * 16}px`,
                borderRadius: store.logoSettings.shape === 'circle' ? '50%' : store.logoSettings.shape === 'rounded' ? '12px' : '0px',
                borderWidth: `${store.logoSettings.borderWidth}px`,
                borderColor: store.logoSettings.borderColor,
                backgroundColor: store.logoSettings.backgroundColor,
                opacity: store.logoSettings.opacity
              }}
            >
              <img 
                src={store.clientLogo} 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-full">
              <span className="text-[10px] font-medium text-center leading-tight px-2">Client<br/>Logo</span>
            </div>
          )}
        </div>
        
        <div className="text-right flex flex-col gap-0.5 w-64">
          <InputNode 
            value={store.headerInfo.name} 
            onChange={(v: string) => store.updateHeaderInfo({ name: v })}
            placeholder="[ Client Name ]"
            className="text-xl font-bold text-right"
            style={{ color: store.brandColors.primary }}
          />
          <InputNode 
            value={store.headerInfo.title} 
            onChange={(v: string) => store.updateHeaderInfo({ title: v })}
            placeholder="[ Job Title ]"
            className="text-gray-600 text-right"
          />
          <InputNode 
            value={store.headerInfo.org} 
            onChange={(v: string) => store.updateHeaderInfo({ org: v })}
            placeholder="[ Organization ]"
            className="text-gray-600 font-medium text-right"
          />
          <InputNode 
            value={store.headerInfo.email} 
            onChange={(v: string) => store.updateHeaderInfo({ email: v })}
            placeholder="[ Email Address ]"
            className="text-gray-500 text-right"
          />
          <InputNode 
            value={store.headerInfo.mobile} 
            onChange={(v: string) => {
              const onlyNums = v.replace(/\D/g, '');
              store.updateHeaderInfo({ mobile: onlyNums.substring(0, 10) }); 
            }}
            placeholder="[ 10 Digit Mobile ]"
            className="text-gray-500 text-right"
            maxLength={10}
          />
        </div>

        {store.showQR && (
          <div className="ml-4">
            <QRCode value={store.headerInfo.mobile ? `tel:${store.headerInfo.mobile}` : store.headerInfo.email} size={80} />
          </div>
        )}
      </div>

      {/* ROW 2 */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4" style={{ color: store.brandColors.primary }}>Products / Services</h3>
        <table className="w-full text-left border-collapse table-fixed text-[11px]" style={{ borderColor: store.tableStyle.borderColor }}>
          <thead>
            <tr style={{ backgroundColor: store.tableStyle.headerBg, color: store.tableStyle.headerText }}>
              {store.visibleColumns.srNo && <th className="p-1.5 border w-8 text-center" style={{ borderColor: store.tableStyle.borderColor }}>Sr</th>}
              {store.visibleColumns.image && <th className="p-1.5 border w-10 text-center" style={{ borderColor: store.tableStyle.borderColor }}>Img</th>}
              {store.visibleColumns.name && <th className="p-1.5 border" style={{ borderColor: store.tableStyle.borderColor }}>Product</th>}
              {store.visibleColumns.description && <th className="p-1.5 border" style={{ borderColor: store.tableStyle.borderColor }}>Description</th>}
              {store.visibleColumns.qty && <th className="p-1.5 border w-10 text-center" style={{ borderColor: store.tableStyle.borderColor }}>Qty</th>}
              {store.visibleColumns.sellingPrice && <th className="p-1.5 border w-16 text-right" style={{ borderColor: store.tableStyle.borderColor }}>Price</th>}
              {store.visibleColumns.discount && <th className="p-1.5 border w-16 text-right" style={{ borderColor: store.tableStyle.borderColor }}>Disc</th>}
              {store.visibleColumns.tax && <th className="p-1.5 border w-16 text-right" style={{ borderColor: store.tableStyle.borderColor }}>Tax</th>}
              {store.visibleColumns.total && <th className="p-1.5 border w-20 text-right" style={{ borderColor: store.tableStyle.borderColor }}>Total</th>}
              <th className="p-1.5 border w-[80px]" style={{ borderColor: store.tableStyle.borderColor }}></th>
            </tr>
          </thead>
          <tbody>
            {pageProducts.map((p, pIdx) => {
              const idx = pageIndex * ITEMS_PER_PAGE + pIdx;
              return (
              <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? store.tableStyle.bodyBg : store.tableStyle.altRowBg }}>
                {store.visibleColumns.srNo && <td className="p-1.5 border text-center" style={{ borderColor: store.tableStyle.borderColor }}>{idx + 1}</td>}
                {store.visibleColumns.image && (
                  <td className="p-1.5 border" style={{ borderColor: store.tableStyle.borderColor }}>
                    <div className="relative w-7 h-7 rounded border border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:bg-gray-50 cursor-pointer pointer-events-auto mx-auto">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-[10px]">+</span>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => store.updateProduct(p.id, { image: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </td>
                )}
                {store.visibleColumns.name && (
                  <td className="p-1.5 border" style={{ borderColor: store.tableStyle.borderColor }}>
                    <textarea 
                      value={p.name} 
                      onChange={(e) => store.updateProduct(p.id, { name: e.target.value })}
                      className="bg-transparent border-none w-full focus:ring-1 focus:ring-blue-500 rounded px-1 hover:bg-gray-100/50 pointer-events-auto resize-none overflow-hidden"
                      rows={2}
                    />
                  </td>
                )}
                {store.visibleColumns.description && (
                  <td className="p-1.5 border" style={{ borderColor: store.tableStyle.borderColor }}>
                    <textarea 
                      value={p.description} 
                      onChange={(e) => store.updateProduct(p.id, { description: e.target.value })}
                      className="bg-transparent border-none w-full focus:ring-1 focus:ring-blue-500 rounded px-1 hover:bg-gray-100/50 pointer-events-auto resize-none overflow-hidden text-[10px] text-gray-500"
                      rows={2}
                    />
                  </td>
                )}
                {store.visibleColumns.qty && (
                  <td className="p-1.5 border" style={{ borderColor: store.tableStyle.borderColor }}>
                    <input 
                      type="number" 
                      value={p.qty} 
                      onChange={(e) => store.updateProduct(p.id, { qty: Number(e.target.value) })}
                      className="bg-transparent border-none w-full text-center focus:ring-1 focus:ring-blue-500 rounded px-0.5 hover:bg-gray-100/50 pointer-events-auto"
                    />
                  </td>
                )}
                {store.visibleColumns.sellingPrice && (
                  <td className="p-1.5 border" style={{ borderColor: store.tableStyle.borderColor }}>
                    <input 
                      type="number" 
                      value={p.sellingPrice} 
                      onChange={(e) => store.updateProduct(p.id, { sellingPrice: Number(e.target.value) })}
                      className="bg-transparent border-none w-full text-right focus:ring-1 focus:ring-blue-500 rounded px-0.5 hover:bg-gray-100/50 pointer-events-auto"
                    />
                  </td>
                )}
                {store.visibleColumns.discount && (
                  <td className="p-1.5 border" style={{ borderColor: store.tableStyle.borderColor }}>
                    <input 
                      type="number" 
                      value={p.discount} 
                      onChange={(e) => store.updateProduct(p.id, { discount: Number(e.target.value) })}
                      className="bg-transparent border-none w-full text-right focus:ring-1 focus:ring-blue-500 rounded px-0.5 hover:bg-gray-100/50 pointer-events-auto"
                    />
                  </td>
                )}
                {store.visibleColumns.tax && (
                  <td className="p-1.5 border" style={{ borderColor: store.tableStyle.borderColor }}>
                    <input 
                      type="number" 
                      value={p.tax} 
                      onChange={(e) => store.updateProduct(p.id, { tax: Number(e.target.value) })}
                      className="bg-transparent border-none w-full text-right focus:ring-1 focus:ring-blue-500 rounded px-0.5 hover:bg-gray-100/50 pointer-events-auto"
                    />
                  </td>
                )}
                {store.visibleColumns.total && (
                  <td className="p-1.5 border font-medium text-right" style={{ borderColor: store.tableStyle.borderColor }}>
                    ₹{((p.qty * p.sellingPrice) - p.discount + p.tax).toLocaleString()}
                  </td>
                )}
                <td className="p-1 border w-[80px] text-center" style={{ borderColor: store.tableStyle.borderColor }}>
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    <button 
                      onClick={() => store.moveProduct(p.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-black hover:bg-white rounded border border-gray-200 disabled:opacity-30 pointer-events-auto"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <button 
                      onClick={() => store.moveProduct(p.id, 'down')}
                      disabled={idx === store.products.length - 1}
                      className="p-1 text-gray-400 hover:text-black hover:bg-white rounded border border-gray-200 disabled:opacity-30 pointer-events-auto"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <button 
                      onClick={() => store.removeProduct(p.id)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded border border-red-100 pointer-events-auto"
                    >
                      <span className="text-[10px] font-bold">×</span>
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-start mt-4">
          <div className="flex gap-2 items-center pointer-events-auto">
            <button 
              onClick={store.addProduct}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors border border-gray-300"
            >
              + Add Custom Row
            </button>
            {productsCatalog.length > 0 && (
              <select 
                className="text-xs border border-gray-300 rounded px-2 py-1.5 bg-white text-gray-700 w-48"
                onChange={(e) => {
                  if (!e.target.value) return;
                  const selectedProduct = productsCatalog.find(p => p.id === e.target.value);
                  if (selectedProduct) {
                    const newProducts = [...store.products, {
                      id: crypto.randomUUID(),
                      name: selectedProduct.name,
                      description: selectedProduct.description || '',
                      qty: 1,
                      sellingPrice: selectedProduct.sellingPrice,
                      discount: 0,
                      tax: selectedProduct.tax || 0,
                      image: selectedProduct.image || ''
                    }];
                    store.setProducts(newProducts);
                  }
                  e.target.value = "";
                }}
              >
                <option value="">+ Add from Catalog...</option>
                {productsCatalog.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ₹{p.sellingPrice}</option>
                ))}
              </select>
            )}
          </div>
        
          {isLastPage && (
            <div className="flex justify-end mt-4 mb-8">
              <div className="w-64 border rounded p-3 bg-gray-50 text-right" style={{ borderColor: store.tableStyle.borderColor }}>
                <div className="flex justify-between mb-1 text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1 text-gray-600">
                  <span>Discount:</span>
                  <span>-₹{discountTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2 text-gray-600">
                  <span>Tax:</span>
                  <span>+₹{taxTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200" style={{ color: store.brandColors.primary }}>
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLastPage && (
          <>
            <div className="mb-8">
        <h3 className="font-bold mb-2 text-gray-700">Notes</h3>
        <textarea 
          value={store.notes}
          onChange={(e) => useProposalStore.setState({ notes: e.target.value })}
          className="w-full bg-transparent hover:bg-gray-50 border-none rounded p-2 text-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 pointer-events-auto"
          rows={3}
        />
      </div>

      {/* ROW 3 */}
      <div className="flex gap-8 border-t border-gray-200 pt-6 mb-8">
        <div className="flex-1 flex flex-col gap-1">
          <h3 className="font-bold mb-3" style={{ color: store.brandColors.secondary }}>Client Details</h3>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 w-20">Name:</span> 
            <InputNode value={store.clientDetails.name} onChange={(v: string) => store.updateClientDetails({ name: v })} placeholder="[ Name ]" className="text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 w-20">Industry:</span> 
            <InputNode value={store.clientDetails.industry} onChange={(v: string) => store.updateClientDetails({ industry: v })} placeholder="[ Industry ]" className="text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 w-20">Status:</span> 
            <InputNode value={store.clientDetails.status} onChange={(v: string) => store.updateClientDetails({ status: v })} placeholder="[ Status ]" className="text-gray-600" />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <h3 className="font-bold mb-3" style={{ color: store.brandColors.secondary }}>Organization Details</h3>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 w-20">Company:</span> 
            <InputNode value={store.orgDetails.company} onChange={(v: string) => store.updateOrgDetails({ company: v })} placeholder="[ Company Name ]" className="text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 w-20">Email:</span> 
            <InputNode value={store.orgDetails.email} onChange={(v: string) => store.updateOrgDetails({ email: v })} placeholder="[ Email ]" className="text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 w-20">Phone:</span> 
            <InputNode value={store.orgDetails.phone} onChange={(v: string) => store.updateOrgDetails({ phone: v })} placeholder="[ Phone Number ]" className="text-gray-600" />
          </div>
        </div>
        </div>
        </>
      )}

      {/* FOOTER */}
      <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-gray-400 text-xs mt-auto">
        <div className="w-64">
          <InputNode value={store.footerInfo.terms} onChange={(v: string) => store.updateFooterInfo({ terms: v })} placeholder="[ Terms & Conditions ]" className="font-medium" />
        </div>
        <div className="flex items-center gap-4">
          <span>Page {pageIndex + 1} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <span>Prepared by</span>
            <InputNode value={store.footerInfo.preparedBy} onChange={(v: string) => store.updateFooterInfo({ preparedBy: v })} placeholder="[ Your Name ]" className="w-32" />
          </div>
          <div className="w-8 h-8 opacity-50">
            <QRCode value="https://example.com" size={32} />
          </div>
        </div>
      </div>
    </div>
        );
      })}
    </div>
  );
}
