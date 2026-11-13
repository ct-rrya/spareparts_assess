'use client';

import React, { useMemo, useState } from 'react';
import { Category, Product } from '@/types';
import { formatPHP } from '@/lib/money';

interface AdminProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export function AdminProductsClient({
  initialProducts,
  categories,
}: AdminProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [specimenCode, setSpecimenCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [imageUrl, setImageUrl] = useState(
    '/images/products/borosilicate-beaker-set.jpg'
  );
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [deleteBlockedProduct, setDeleteBlockedProduct] =
    useState<Product | null>(null);

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

  function openAddForm() {
    setEditingId(null);
    setSpecimenCode('');
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('');
    setStock('10');
    setImageUrl('/images/products/borosilicate-beaker-set.jpg');
    setIsActive(true);
    setShowForm(true);
    setFeedback(null);
  }

  function openEditForm(p: Product) {
    setEditingId(p.id);
    setSpecimenCode(p.specimen_code);
    setName(p.name);
    setCategoryId(p.category_id);
    setDescription(p.description);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setImageUrl(p.image_url);
    setIsActive(p.is_active);
    setShowForm(true);
    setFeedback(null);
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
          image_url: imageUrl.trim(),
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
      setShowForm(false);
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
      <div className="flex flex-wrap justify-between items-end border-b border-[#D5DCF3] pb-4 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E0B33] m-0">
            Products
          </h1>
          <p className="text-sm text-[#4A4F78] mt-1 mb-0">
            Add, edit, and manage catalog inventory availability.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white px-4 h-11 text-sm font-bold transition-colors cursor-pointer"
        >
          + Add Product
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-md border p-3.5 flex flex-wrap justify-between items-center gap-3 text-sm ${
            feedback.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span className="font-medium">{feedback.text}</span>
          {deleteBlockedProduct && (
            <button
              type="button"
              onClick={() => handleMarkInactive(deleteBlockedProduct)}
              className="rounded bg-[#1F06AC] text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-[#170485] cursor-pointer"
            >
              Mark Inactive Instead
            </button>
          )}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-lg border border-slate-200 bg-white p-6 flex flex-col gap-4 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold m-0">
              {editingId ? 'Edit Product' : 'New Product'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">
                Specimen Code
              </span>
              <input
                type="text"
                value={specimenCode}
                onChange={(e) => setSpecimenCode(e.target.value)}
                placeholder="SP-04.1 (auto if blank)"
                className="rounded-md border border-slate-300 px-3 h-10 text-sm focus:outline-none focus:border-[#1F06AC]"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">
                Product Name *
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-slate-300 px-3 h-10 text-sm focus:outline-none focus:border-[#1F06AC]"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">
                Category *
              </span>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-md border border-slate-300 px-3 h-10 text-sm bg-white focus:outline-none focus:border-[#1F06AC]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">
                Price (PHP) *
              </span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-md border border-slate-300 px-3 h-10 text-sm focus:outline-none focus:border-[#1F06AC]"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">
                Stock Quantity *
              </span>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-md border border-slate-300 px-3 h-10 text-sm focus:outline-none focus:border-[#1F06AC]"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">
                Image URL / Path
              </span>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/products/..."
                className="rounded-md border border-slate-300 px-3 h-10 text-sm focus:outline-none focus:border-[#1F06AC]"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">
              Description
            </span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1F06AC]"
            />
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-[#1F06AC]"
            />
            <span>Active (visible on customer storefront)</span>
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-[#1F06AC] text-white px-5 h-10 text-sm font-semibold hover:bg-[#170485] cursor-pointer"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Product'
                  : 'Save Product'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product or code..."
          className="rounded-md border border-slate-300 px-3.5 h-10 text-sm bg-white focus:outline-none focus:border-[#1F06AC]"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 h-10 text-sm bg-white focus:outline-none focus:border-[#1F06AC]"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 h-10 text-sm bg-white focus:outline-none focus:border-[#1F06AC]"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out-of-stock">Out of Stock (Active)</option>
        </select>
      </div>

      <div className="rounded-lg border border-[#D5DCF3] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px] text-sm">
            <thead>
              <tr className="bg-[#F6F7FB] border-b border-[#D5DCF3] text-left sp-mono text-xs font-semibold text-[#4A4F78]">
                <th className="p-3.5">PRODUCT</th>
                <th className="p-3.5">CATEGORY</th>
                <th className="p-3.5">PRICE</th>
                <th className="p-3.5">STOCK</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#4A4F78]">
                    No products match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const displayStatus = !p.is_active
                    ? 'Inactive'
                    : p.stock <= 0
                      ? 'Out of Stock'
                      : 'Active';
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[#EEF1FB] last:border-b-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-11 h-11 rounded-lg object-contain bg-[#EAEFFC] border border-[#D5DCF3] p-1 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-[#0E0B33]">
                              {p.name}
                            </div>
                            <div className="sp-mono text-xs text-[#4A4F78]">
                              {p.specimen_code.replace('SP-', '№ ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-[#4A4F78]">
                        {p.category?.name || '—'}
                      </td>
                      <td className="p-3.5 font-bold text-base text-[#1F06AC]">
                        {formatPHP(p.price)}
                      </td>
                      <td className="p-3.5 sp-mono font-bold text-[#0E0B33]">{p.stock}</td>
                      <td className="p-3.5">
                        <span
                          className={`sp-mono inline-block rounded-md border px-2.5 py-1 text-xs font-bold ${
                            displayStatus === 'Active'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : displayStatus === 'Out of Stock'
                                ? 'border-amber-200 bg-amber-50 text-amber-800'
                                : 'border-slate-200 bg-slate-100 text-slate-700'
                          }`}
                        >
                          {displayStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(p)}
                            className="rounded-lg border border-[#C9D2F0] px-3 py-1.5 text-xs font-bold text-[#0E0B33] bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
