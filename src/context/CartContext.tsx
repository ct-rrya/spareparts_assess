'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CartItem, Product } from '@/types';
import { calcCartTotal } from '@/lib/money';

const CART_STORAGE_KEY = 'spare_parts_cart_v1';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  hydrated: boolean;
  addToCart: (product: Product, quantity?: number) => { ok: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  syncItemStock: (productId: string, maxStock: number, unitPrice: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // load saved cart from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated]);

  const addToCart = useCallback(
    (product: Product, quantity = 1): { ok: boolean; message?: string } => {
      if (!product.is_active) {
        return { ok: false, message: 'This product is no longer available.' };
      }
      if (product.stock <= 0) {
        return { ok: false, message: 'This item is currently out of stock.' };
      }

      const qtyToAdd = Math.floor(Number(quantity));
      if (!Number.isInteger(qtyToAdd) || qtyToAdd <= 0) {
        return { ok: false, message: 'Quantity must be a positive whole number.' };
      }

      let blockedMsg: string | undefined;

      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.productId === product.id);
        if (existingIdx !== -1) {
          const existing = prev[existingIdx];
          const nextQty = existing.quantity + qtyToAdd;
          if (nextQty > product.stock) {
            blockedMsg = `Only ${product.stock} unit(s) available in stock.`;
            return prev;
          }
          const copy = [...prev];
          copy[existingIdx] = {
            ...existing,
            unitPrice: product.price,
            maxStock: product.stock,
            quantity: nextQty,
          };
          return copy;
        }

        if (qtyToAdd > product.stock) {
          blockedMsg = `Only ${product.stock} unit(s) available in stock.`;
          return prev;
        }

        return [
          ...prev,
          {
            productId: product.id,
            specimenCode: product.specimen_code,
            name: product.name,
            categoryName: product.category?.name || 'Supplies',
            imageUrl: product.image_url,
            unitPrice: product.price,
            quantity: qtyToAdd,
            maxStock: product.stock,
          },
        ];
      });

      if (blockedMsg) return { ok: false, message: blockedMsg };
      return { ok: true };
    },
    []
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const qty = Math.floor(Number(quantity));
    if (!Number.isInteger(qty) || qty <= 0) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const clamped = Math.min(qty, Math.max(1, item.maxStock));
        return { ...item, quantity: clamped };
      })
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const syncItemStock = useCallback(
    (productId: string, maxStock: number, unitPrice: number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                maxStock,
                unitPrice,
                quantity: Math.min(item.quantity, Math.max(1, maxStock)),
              }
            : item
        )
      );
    },
    []
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(() => calcCartTotal(items), [items]);
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        total,
        hydrated,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        syncItemStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

