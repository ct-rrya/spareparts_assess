'use client';

import React, { useState } from 'react';
import { Category } from '@/types';

export function AdminCategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  async function reload() {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories || []);
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description || '');
    setFeedback(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setDescription('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (!name.trim()) {
      setFeedback({ ok: false, text: 'Category name is required.' });
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/categories/${editingId}`
        : '/api/categories';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, text: data.error || 'Failed to save category.' });
        setSaving(false);
        return;
      }

      await reload();
      cancelEdit();
      setFeedback({
        ok: true,
        text: editingId ? 'Category updated.' : 'Category created.',
      });
    } catch {
      setFeedback({ ok: false, text: 'Network error while saving.' });
    } finally {
      setSaving(false);
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
    setFeedback({ ok: true, text: `Deleted category "${c.name}".` });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[#D5DCF3] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E0B33] m-0">
          Categories
        </h1>
        <p className="text-sm text-[#4A4F78] mt-1 mb-0">
          Organize specimens into customer storefront categories.
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-lg border p-4 text-sm font-medium ${
            feedback.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-[#D5DCF3] bg-white p-6 flex flex-col gap-4 shadow-sm"
      >
        <div className="flex justify-between items-center border-b border-dashed border-[#D5DCF3] pb-3">
          <h2 className="text-lg font-bold text-[#0E0B33] m-0">
            {editingId ? 'Edit Category' : 'Add Category'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-[#C9D2F0] px-3 py-1 text-xs font-semibold text-[#4A4F78] hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="sp-mono text-xs font-semibold text-[#4A4F78]">
              Category Name *
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diagnostic Instruments"
              className="rounded-lg border border-[#C9D2F0] px-3.5 h-11 text-sm font-semibold text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="sp-mono text-xs font-semibold text-[#4A4F78]">
              Description
            </span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
              className="rounded-lg border border-[#C9D2F0] px-3.5 h-11 text-sm text-[#0E0B33] focus:outline-none focus:border-[#1F06AC]"
            />
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#0F42C0] hover:bg-[#1F06AC] text-white px-6 h-11 text-sm font-bold transition-colors cursor-pointer"
          >
            {saving
              ? 'Saving...'
              : editingId
                ? 'Update Category'
                : '+ Create Category'}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-[#D5DCF3] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[540px] text-sm">
            <thead>
              <tr className="bg-[#F6F7FB] border-b border-[#D5DCF3] text-left sp-mono text-xs font-semibold text-[#4A4F78]">
                <th className="p-3.5">CODE</th>
                <th className="p-3.5">CATEGORY NAME</th>
                <th className="p-3.5">SPECIMENS</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[#EEF1FB] last:border-b-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-3.5 font-bold sp-mono text-[#0F42C0]">{c.code}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-[#0E0B33]">{c.name}</div>
                    {c.description && (
                      <div className="text-xs text-[#4A4F78] mt-0.5">{c.description}</div>
                    )}
                  </td>
                  <td className="p-3.5 sp-mono font-bold text-[#0E0B33]">{c.product_count ?? 0}</td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="rounded-lg border border-[#C9D2F0] px-3 py-1.5 text-xs font-bold text-[#0E0B33] bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
