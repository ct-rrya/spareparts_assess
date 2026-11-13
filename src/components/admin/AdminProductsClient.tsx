'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Category, Product } from '@/types';
import { formatPHP } from '@/lib/money';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface AdminProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
}

// resize uploaded photos on canvas so they stay lightweight
async function fileToDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  if (file.type === 'image/svg+xml') return raw;

  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 960;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(raw);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };
    img.onerror = () => resolve(raw);
    img.src = raw;
  });
}

export function AdminProductsClient({
  initialProducts,
  categories,
}: AdminProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalMode, setModalMode] = useState<'add' | 'view' | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const [specimenCode, setSpecimenCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [deleteBlockedProduct, setDeleteBlockedProduct] =
    useState<Product | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.specimen_code.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (categoryFilter !== 'all' && p.category_id !== categoryFilter) {
        return false;
      }
      if (statusFilter === 'active' && !p.is_active) return false;
      if (statusFilter === 'inactive' && p.is_active) return false;
      if (statusFilter === 'out-of-stock' && (!p.is_active || p.stock > 0)) {
        return false;
      }
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  function openAddModal() {
    setActiveProduct(null);
    setSpecimenCode('');
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('');
    setStock('10');
    setImageUrl('');
    setIsActive(true);
    setModalMode('add');
    setFeedback(null);
  }

  function openProductModal(p: Product) {
    setActiveProduct(p);
    setSpecimenCode(p.specimen_code);
    setName(p.name);
    setCategoryId(p.category_id);
    setDescription(p.description);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setImageUrl(p.image_url);
    setIsActive(p.is_active);
    setModalMode('view');
    setFeedback(null);
  }

  function closeModal() {
    setModalMode(null);
    setActiveProduct(null);
    setIsDragging(false);
  }

  async function handleImageFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) {
      setFeedback({ ok: false, text: 'Please select a valid image file.' });
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setImageUrl(dataUrl);
    } catch {
      setFeedback({ ok: false, text: 'Could not read image file.' });
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    void handleImageFile(file);
  }

  async function reloadProducts() {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products || []);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!name.trim()) {
      setFeedback({ ok: false, text: 'Product name is required.' });
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFeedback({ ok: false, text: 'Price must be greater than zero.' });
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setFeedback({
        ok: false,
        text: 'Stock must be a whole number of 0 or more.',
      });
      return;
    }

    setSaving(true);
    try {
      const editingId = activeProduct?.id;
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specimen_code: specimenCode.trim(),
          name: name.trim(),
          category_id: categoryId,
          description: description.trim(),
          price: parsedPrice,
          stock: parsedStock,
          image_url:
            imageUrl.trim() || '/images/products/borosilicate-beaker-set.jpg',
          is_active: isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, text: data.error || 'Failed to save product.' });
        setSaving(false);
        return;
      }

      await reloadProducts();
      closeModal();
      setFeedback({
        ok: true,
        text: editingId ? 'Product updated.' : 'Product created.',
      });
    } catch {
      setFeedback({ ok: false, text: 'Network error while saving product.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    setDeleteBlockedProduct(null);
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      return;
    }

    const res = await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      if (data.referencedInOrder) {
        setDeleteBlockedProduct(p);
      }
      setFeedback({ ok: false, text: data.error || 'Could not delete product.' });
      return;
    }

    await reloadProducts();
    setFeedback({ ok: true, text: `Deleted "${p.name}".` });
  }

  async function handleMarkInactive(p: Product) {
    const res = await fetch(`/api/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        specimen_code: p.specimen_code,
        name: p.name,
        category_id: p.category_id,
        description: p.description,
        price: p.price,
        stock: p.stock,
        image_url: p.image_url,
        is_active: false,
      }),
    });

    if (res.ok) {
      setDeleteBlockedProduct(null);
      await reloadProducts();
      setFeedback({
        ok: true,
        text: `"${p.name}" marked inactive to preserve order history.`,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* header matching design board */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-catchye m-0 text-[32px] sm:text-[36px] leading-none tracking-[-0.01em] text-[#121212]">
            Products
          </h1>
          <p className="sp-mono mt-2 mb-0 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
            {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'} ·{' '}
            {categories.length}{' '}
            {categories.length === 1 ? 'CATEGORY' : 'CATEGORIES'}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="hidden md:inline-flex h-10 cursor-pointer items-center rounded-[6px] bg-[#E5F24E] px-4 text-[13px] font-semibold text-[#1F06AC] transition-colors hover:bg-[#dce940]"
        >
          + Add product
        </button>
      </div>

      {/* mobile search + add row */}
      <div className="flex md:hidden items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or SKU"
          className="flex-1 min-w-0 h-10 rounded-[6px] border border-[#E2E4EC] bg-white px-3.5 text-sm text-[#121212] placeholder:text-[#9CA3AF] focus:border-[#1F06AC] focus:outline-none"
        />
        <button
          type="button"
          onClick={openAddModal}
          className="h-10 shrink-0 cursor-pointer rounded-[6px] bg-[#E5F24E] px-4 text-[13px] font-semibold text-[#1F06AC] transition-colors hover:bg-[#dce940]"
        >
          + Add
        </button>
      </div>

      {feedback && !modalMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#E2E4EC] bg-white p-3.5 text-sm text-[#121212]">
          <span className="font-medium">{feedback.text}</span>
          {deleteBlockedProduct && (
            <button
              type="button"
              onClick={() => handleMarkInactive(deleteBlockedProduct)}
              className="cursor-pointer rounded-[6px] bg-[#1F06AC] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#170485]"
            >
              Mark Inactive Instead
            </button>
          )}
        </div>
      )}

      {/* desktop filters */}
      <div className="hidden md:grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product or SKU..."
          className="h-10 rounded-[6px] border border-[#E2E4EC] bg-white px-3.5 text-sm text-[#121212] placeholder:text-[#9CA3AF] focus:border-[#1F06AC] focus:outline-none"
        />

        <CustomSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          ariaLabel="Filter by category"
          options={[
            { value: 'all', label: 'All categories' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          ariaLabel="Filter by status"
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'out-of-stock', label: 'Out of Stock (Active)' },
          ]}
        />
      </div>

      {/* mobile product cards */}
      <div className="md:hidden flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-[8px] border border-[#E2E4EC] bg-white p-8 text-center text-sm text-[#7D8292]">
            No products match your filter.
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-[8px] border border-[#E2E4EC] bg-white p-3 flex items-center gap-3"
            >
              <div className="h-14 w-14 rounded-md bg-[#EEF1FB] border border-[#E2E4EC] overflow-hidden shrink-0 flex items-center justify-center">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="sp-mono text-[10px] text-[#7D8292]">IMG</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13.5px] font-semibold text-[#121212] truncate m-0">
                    {p.name}
                  </p>
                  {!p.is_active && (
                    <span className="sp-mono text-[9px] uppercase text-[#7D8292] shrink-0">
                      INACTIVE
                    </span>
                  )}
                </div>
                <p className="sp-mono text-[10.5px] text-[#7D8292] mt-0.5 mb-0 truncate">
                  {p.specimen_code}
                </p>
                <div className="flex items-center gap-2.5 mt-1">
                  <span className="text-[13px] font-bold text-[#1F06AC]">
                    {formatPHP(p.price)}
                  </span>
                  <span className="sp-mono text-[10.5px] text-[#5C6072]">
                    STOCK {p.stock}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openProductModal(p)}
                className="shrink-0 h-9 px-3.5 rounded-md border border-[#D5DCF3] bg-white hover:bg-[#F7F8FC] text-xs font-semibold text-[#1F06AC] cursor-pointer"
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>

      {/* simple neutral table (desktop) */}
      <div className="hidden md:block overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="sp-mono border-b border-[#ECEEF4] bg-[#F7F8FC] text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                <th className="px-5 py-3 font-medium">PRODUCT NAME</th>
                <th className="px-5 py-3 font-medium">PRICE</th>
                <th className="px-5 py-3 font-medium">STOCK</th>
                <th className="px-5 py-3 text-right font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEEF4]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-[#7D8292]"
                  >
                    No products match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-[#F9FAFC]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="text-[13.5px] font-semibold text-[#121212]">
                        {p.name}
                      </div>
                      {!p.is_active && (
                        <div className="sp-mono mt-0.5 text-[10px] uppercase tracking-[0.06em] text-[#7D8292]">
                          INACTIVE
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] font-medium text-[#121212]">
                      {formatPHP(p.price)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#5C6072]">
                      {p.stock}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-3 text-[12.5px] font-medium">
                        <button
                          type="button"
                          onClick={() => openProductModal(p)}
                          className="cursor-pointer text-[#121212] hover:text-[#1F06AC] hover:underline"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="cursor-pointer text-[#7D8292] hover:text-[#B91C1C] hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* add / editable view modal */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[10px] border border-[#E2E4EC] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ECEEF4] px-6 py-4">
              <div>
                <h2 className="font-catchye m-0 text-[26px] leading-none text-[#121212]">
                  {modalMode === 'add' ? 'Add Product' : activeProduct?.name}
                </h2>
                {modalMode === 'view' && activeProduct && (
                  <p className="sp-mono mt-1.5 mb-0 text-[10.5px] uppercase tracking-[0.06em] text-[#7D8292]">
                    SKU {activeProduct.specimen_code} · SLUG {activeProduct.slug}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-[6px] border border-[#E2E4EC] px-3 py-1.5 text-xs font-medium text-[#5C6072] hover:bg-[#F7F8FC] hover:text-[#121212]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 p-6">
              {feedback && (
                <div className="rounded-[6px] border border-[#E2E4EC] bg-[#F7F8FC] px-3.5 py-2.5 text-xs font-medium text-[#121212]">
                  {feedback.text}
                </div>
              )}

              {/* image drag & drop / file picker + status toggle */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[200px_1fr]">
                <div>
                  <span className="sp-mono mb-1.5 block text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                    PRODUCT IMAGE
                  </span>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative flex h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[8px] border-2 border-dashed p-3 text-center transition-colors ${
                      isDragging
                        ? 'border-[#1F06AC] bg-[#F4F6FF]'
                        : 'border-[#D5DCF3] bg-[#F9FAFC] hover:border-[#1F06AC]'
                    }`}
                  >
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt={name || 'Product preview'}
                          className="h-full w-full object-contain"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Drop or click to replace
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1.5 px-2">
                        <p className="text-xs font-semibold text-[#121212]">
                          Drop image here
                        </p>
                        <p className="text-[11px] text-[#7D8292]">
                          or click to select from device
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleImageFile(e.target.files?.[0])}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        PRODUCT NAME *
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        SPECIMEN CODE
                      </span>
                      <input
                        type="text"
                        value={specimenCode}
                        onChange={(e) => setSpecimenCode(e.target.value)}
                        placeholder="Auto if blank"
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        CATEGORY *
                      </span>
                      <CustomSelect
                        value={categoryId}
                        onChange={setCategoryId}
                        ariaLabel="Product category"
                        options={categories.map((c) => ({
                          value: c.id,
                          label: c.name,
                        }))}
                      />
                    </div>

                    <label className="flex flex-col gap-1">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        PRICE (PHP) *
                      </span>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                        STOCK *
                      </span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                      />
                    </label>
                  </div>

                  {/* status toggle */}
                  <div className="flex items-center justify-between rounded-[6px] border border-[#E2E4EC] bg-[#F9FAFC] px-3.5 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-[#121212]">
                        Storefront Status
                      </p>
                      <p className="text-[11px] text-[#7D8292]">
                        {isActive
                          ? 'Active — visible to customers'
                          : 'Inactive — hidden from storefront'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      onClick={() => setIsActive((v) => !v)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                        isActive ? 'bg-[#1F06AC]' : 'bg-[#CBD5E1]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                  DESCRIPTION
                </span>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product specifications, materials, included accessories..."
                  className="rounded-[6px] border border-[#E2E4EC] px-3 py-2 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                />
              </label>

              <div className="flex items-center justify-end gap-3 border-t border-[#ECEEF4] pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-10 cursor-pointer rounded-[6px] border border-[#E2E4EC] px-4 text-sm font-medium text-[#5C6072] hover:bg-[#F7F8FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 cursor-pointer rounded-[6px] bg-[#1F06AC] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#170485] disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : modalMode === 'add'
                      ? 'Save Product'
                      : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
