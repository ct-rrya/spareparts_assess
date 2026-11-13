export const PAYMENT_METHODS = [
  'Cash on Delivery',
  'E-Wallet',
  'Bank Transfer',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Shipped',
  'Completed',
  'Cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// linear progression order before completion
export const ORDER_PROGRESS_STEPS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Shipped',
  'Completed',
] as const;

export interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  product_count?: number;
}

export interface Product {
  id: string;
  specimen_code: string;
  name: string;
  slug: string;
  category_id: string;
  category?: Category | null;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  specimenCode: string;
  name: string;
  categoryName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  specimen_code_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  contact_number: string;
  delivery_address: string;
  payment_method: PaymentMethod;
  order_notes: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  stock_restored: boolean;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CustomerSummary {
  email: string;
  name: string;
  contact_number: string;
  order_count: number;
  last_order_date: string;
  total_completed_spent: number;
}

