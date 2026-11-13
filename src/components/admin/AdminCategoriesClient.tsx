'use client';

import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Category } from '@/types';

export function AdminCategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const totalProducts = useMemo(
    () => categories.reduce((sum, c) => sum + (c.product_count ?? 0), 0),
    [categories]
  );

  const nextDisplayNumber = useMemo(
    () => String(categories.length + 1).padStart(2, '0'),
    [categories.length]
  );

  async function reload() {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories || []);
    }
  }

  function startEdit(c: Category) {
    setEditingCategory(c);
    setEditName(c.name);
    setEditDescription(c.description || '');
    setFeedback(null);
  }

  function closeEditModal() {
    setEditingCategory(null);
    setEditName('');
    setEditDescription('');
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (!name.trim()) {
      setFeedback({ ok: false, text: 'Category name is required.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, text: data.error || 'Failed to save category.' });
        setSaving(false);
        return;
      }

      await reload();
      setName('');
      setFeedback({ ok: true, text: 'Category created.' });
    } catch {
      setFeedback({ ok: false, text: 'Network error while saving.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    setFeedback(null);
    if (!editName.trim()) {
      setFeedback({ ok: false, text: 'Category name is required.' });
      return;
    }

    setEditSaving(true);
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, text: data.error || 'Failed to update category.' });
        setEditSaving(false);
        return;
      }

      await reload();
      closeEditModal();
      setFeedback({ ok: true, text: 'Category updated.' });
    } catch {
      setFeedback({ ok: false, text: 'Network error while updating.' });
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(c: Category) {
    setFeedback(null);
    if (!window.confirm(`Delete category "${c.name}"?`)) return;

    const res = await fetch(`/api/categories/${c.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({
        ok: false,
        text: data.error || 'Cannot delete category.',
      });
      return;
    }

    await reload();
    if (editingCategory?.id === c.id) closeEditModal();
    setFeedback({ ok: true, text: `Deleted category "${c.name}".` });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* header matching design board */}
      <div>
        <h1 className="font-catchye m-0 text-[36px] leading-none tracking-[-0.01em] text-[#121212]">
          Categories
        </h1>
        <p className="sp-mono mt-2 mb-0 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
          {categories.length}{' '}
          {categories.length === 1 ? 'CATEGORY' : 'CATEGORIES'} ·{' '}
          {totalProducts} {totalProducts === 1 ? 'PRODUCT' : 'PRODUCTS'}
        </p>
      </div>

      {feedback && (
        <div className="rounded-[8px] border border-[#E2E4EC] bg-white px-4 py-3 text-sm font-medium text-[#121212]">
          {feedback.text}
        </div>
      )}

      {/* 2-col layout: table on left, add/edit card on right */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
          <div className="w-full">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="sp-mono border-b border-[#ECEEF4] bg-[#F7F8FC] text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                  <th className="w-10 sm:w-16 px-2.5 py-2.5 sm:px-5 sm:py-3 font-medium">№</th>
                  <th className="px-2 py-2.5 sm:px-5 sm:py-3 font-medium">NAME</th>
                  <th className="px-2 py-2.5 sm:px-5 sm:py-3 font-medium whitespace-nowrap">PRODUCTS</th>
                  <th className="px-2.5 py-2.5 sm:px-5 sm:py-3 text-right font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF4]">
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-sm text-[#7D8292]"
                    >
                      No categories yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-[#F9FAFC]"
                    >
                      <td className="px-2.5 py-3 sm:px-5 sm:py-4">
                        <span className="sp-mono inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-[6px] bg-[#1F06AC] text-[10px] sm:text-[11px] font-semibold text-white">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-2 py-3 sm:px-5 sm:py-4 text-xs sm:text-[13.5px] font-semibold text-[#121212]">
                        {c.name}
                      </td>
                      <td className="sp-mono px-2 py-3 sm:px-5 sm:py-4 text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.05em] text-[#5C6072] whitespace-nowrap">
                        {String(c.product_count ?? 0).padStart(2, '0')}{' '}
                        <span className="hidden sm:inline">PRODUCTS</span>
                        <span className="sm:hidden">ITEMS</span>
                      </td>
                      <td className="px-2.5 py-3 sm:px-5 sm:py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 sm:gap-3 text-xs sm:text-[12.5px] font-medium">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="cursor-pointer text-[#1C47CC] hover:underline"
                          >
                            Edit
                          </button>
                          {(c.product_count ?? 0) === 0 && (
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              className="cursor-pointer text-[#7D8292] hover:text-[#B91C1C] hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={handleAddSubmit}
          className="overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white"
        >
          <div className="flex items-center justify-between border-b border-dashed border-[#E2E4EC] px-5 py-3.5">
            <h2 className="sp-mono m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5C6072]">
              ADD CATEGORY
            </h2>
          </div>

          <div className="space-y-4 p-5">
            <label className="flex flex-col gap-1.5">
              <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                NAME
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Safety & Protective Gear"
                className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] placeholder:text-[#9CA3AF] focus:border-[#1F06AC] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                DISPLAY NUMBER
              </span>
              <input
                type="text"
                readOnly
                value={nextDisplayNumber}
                className="sp-mono h-10 rounded-[6px] border border-[#E2E4EC] bg-[#F9FAFC] px-3 text-sm text-[#5C6072] focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="h-10 w-full cursor-pointer rounded-[6px] bg-[#0F42C0] text-[13px] font-semibold text-white transition-colors hover:bg-[#1F06AC] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save category'}
            </button>

            <p className="m-0 text-[12px] leading-relaxed text-[#7D8292]">
              A category can only be deleted once it has no products assigned.
            </p>
          </div>
        </form>
      </div>

      {/* edit category modal */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
          onClick={closeEditModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-[10px] border border-[#E2E4EC] bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#ECEEF4] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="sp-mono inline-flex h-6 w-6 items-center justify-center rounded-[5px] bg-[#1F06AC] text-[10px] font-semibold text-white">
                  {editingCategory.code}
                </span>
                <h2 className="sp-mono m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#121212]">
                  EDIT CATEGORY
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                aria-label="Close modal"
                className="cursor-pointer rounded-md p-1 text-[#7D8292] hover:bg-[#F7F8FC] hover:text-[#121212]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 p-5">
              <label className="flex flex-col gap-1.5">
                <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                  NAME
                </span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-10 rounded-[6px] border border-[#E2E4EC] px-3 text-sm text-[#121212] focus:border-[#1F06AC] focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="sp-mono text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                  DESCRIPTION
                </span>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Optional category description"
                  className="rounded-[6px] border border-[#E2E4EC] p-3 text-sm text-[#121212] placeholder:text-[#9CA3AF] focus:border-[#1F06AC] focus:outline-none"
                />
              </label>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="h-10 flex-1 cursor-pointer rounded-[6px] border border-[#E2E4EC] bg-white text-[13px] font-semibold text-[#5C6072] hover:bg-[#F7F8FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="h-10 flex-1 cursor-pointer rounded-[6px] bg-[#0F42C0] text-[13px] font-semibold text-white transition-colors hover:bg-[#1F06AC] disabled:opacity-60"
                >
                  {editSaving ? 'Saving...' : 'Update category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
