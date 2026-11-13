import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Category,
  CustomerSummary,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
} from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { calcLineTotal, fromCentavos, toCentavos } from './money';
import { canTransitionOrderStatus, shouldRestoreStock } from './orders';

interface DemoDatabase {
  categories: Category[];
  products: Product[];
  orders: Order[];
  order_items: OrderItem[];
}

const DEMO_DB_PATH = path.join(process.cwd(), '.data', 'demo-db.json');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildInitialDemoData(): DemoDatabase {
  const now = new Date().toISOString();
  const cat1Id = 'cat-01-anatomy';
  const cat2Id = 'cat-02-lab';
  const cat3Id = 'cat-03-specimens';

  const categories: Category[] = [
    {
      id: cat1Id,
      code: '01',
      name: 'Anatomy & Physiology',
      slug: 'anatomy-physiology',
      description:
        'Scale anatomical models and dissection study aids for classroom and lab reference.',
      created_at: now,
    },
    {
      id: cat2Id,
      code: '02',
      name: 'Lab Essentials',
      slug: 'lab-essentials',
      description:
        'Borosilicate glassware, measuring cylinders, racks, and precision pipettes.',
      created_at: now,
    },
    {
      id: cat3Id,
      code: '03',
      name: 'Specimens & Study Tools',
      slug: 'specimens-study-tools',
      description:
        'Prepared microscope slides, petri dishes, optical kits, and specimen containers.',
      created_at: now,
    },
  ];

  const products: Product[] = [
    {
      id: 'prod-01-1',
      specimen_code: 'SP-01.1',
      name: 'Human Skeleton Model',
      slug: 'human-skeleton-model',
      category_id: cat1Id,
      description:
        'Full-scale 170cm articulated PVC human skeleton model on a rolling 5-caster stand with removable skull cap and articulated jaw.',
      price: 4850.0,
      stock: 6,
      image_url: '/images/products/human-skeleton-model.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-01-2',
      specimen_code: 'SP-01.2',
      name: 'Removable Heart Model',
      slug: 'removable-heart-model',
      category_id: cat1Id,
      description:
        '2x life-size 2-part anatomical heart model showing chambers, valves, coronary vessels, and aortic arch on a display base.',
      price: 1650.0,
      stock: 12,
      image_url: '/images/products/removable-heart-model.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-01-3',
      specimen_code: 'SP-01.3',
      name: 'Brain Anatomy Model',
      slug: 'brain-anatomy-model',
      category_id: cat1Id,
      description:
        '8-part life-size human brain model with color-coded functional regions, cerebellum, and brainstem.',
      price: 1980.0,
      stock: 8,
      image_url: '/images/products/brain-anatomy-model.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-01-4',
      specimen_code: 'SP-01.4',
      name: 'Human Torso Model',
      slug: 'human-torso-model',
      category_id: cat1Id,
      description:
        'Half-size 15-part unisex human torso model with removable lungs, heart, liver, stomach, and intestines.',
      price: 3200.0,
      stock: 5,
      image_url: '/images/products/human-torso-model.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-02-1',
      specimen_code: 'SP-02.1',
      name: 'Borosilicate Beaker Set',
      slug: 'borosilicate-beaker-set',
      category_id: cat2Id,
      description:
        '5-piece heavy-wall 3.3 borosilicate glass beaker set (50ml, 100ml, 250ml, 500ml, 1000ml) with printed graduations.',
      price: 1250.0,
      stock: 18,
      image_url: '/images/products/borosilicate-beaker-set.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-02-2',
      specimen_code: 'SP-02.2',
      name: 'Graduated Cylinder',
      slug: 'graduated-cylinder',
      category_id: cat2Id,
      description:
        'Class A 250ml borosilicate glass graduated cylinder with hexagonal base and pouring spout.',
      price: 480.0,
      stock: 24,
      image_url: '/images/products/graduated-cylinder.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-02-3',
      specimen_code: 'SP-02.3',
      name: 'Test Tube Rack',
      slug: 'test-tube-rack',
      category_id: cat2Id,
      description:
        '24-well autoclavable polypropylene and stainless test tube rack for 16mm-20mm tubes. Currently awaiting restock.',
      price: 360.0,
      stock: 0,
      image_url: '/images/products/test-tube-rack.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-02-4',
      specimen_code: 'SP-02.4',
      name: 'Laboratory Pipette Set',
      slug: 'laboratory-pipette-set',
      category_id: cat2Id,
      description:
        'Variable volume micropipette (100-1000uL) with calibration certificate and sterile tip box.',
      price: 2450.0,
      stock: 9,
      image_url: '/images/products/laboratory-pipette-set.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-03-1',
      specimen_code: 'SP-03.1',
      name: 'Prepared Microscope Slides',
      slug: 'prepared-microscope-slides',
      category_id: cat3Id,
      description:
        '25-piece prepared glass slide set covering plant histology, mitosis, and mammalian tissues in a wooden case.',
      price: 890.0,
      stock: 15,
      image_url: '/images/products/prepared-microscope-slides.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-03-2',
      specimen_code: 'SP-03.2',
      name: 'Petri Dish Set',
      slug: 'petri-dish-set',
      category_id: cat3Id,
      description:
        'Pack of 20 sterile 90mm x 15mm optically clear polystyrene petri dishes with vented lids.',
      price: 320.0,
      stock: 30,
      image_url: '/images/products/petri-dish-set.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-03-3',
      specimen_code: 'SP-03.3',
      name: 'Microscope Accessory Kit',
      slug: 'microscope-accessory-kit',
      category_id: cat3Id,
      description:
        'Complete optical maintenance and prep kit with lens tissue, immersion oil, cover slips, and stainless forceps.',
      price: 640.0,
      stock: 11,
      image_url: '/images/products/microscope-accessory-kit.jpg',
      is_active: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'prod-03-4',
      specimen_code: 'SP-03.4',
      name: 'Specimen Storage Jars',
      slug: 'specimen-storage-jars',
      category_id: cat3Id,
      description:
        'Set of 6 wide-mouth 500ml amber glass specimen jars with chemical-resistant PTFE-lined caps (discontinued batch).',
      price: 750.0,
      stock: 4,
      image_url: '/images/products/specimen-storage-jars.jpg',
      is_active: false,
      is_featured: false,
      created_at: now,
      updated_at: now,
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord-demo-1',
      order_number: 'ORD-0001',
      customer_name: 'Elena Santos',
      customer_email: 'elena.santos@example.com',
      contact_number: '+63 917 555 0101',
      delivery_address: '42 Katipunan Ave, Quezon City, Metro Manila',
      payment_method: 'Cash on Delivery',
      order_notes: 'Deliver to science dept receiving desk',
      status: 'Completed',
      subtotal: 2900.0,
      total: 2900.0,
      stock_restored: false,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'ord-demo-2',
      order_number: 'ORD-0002',
      customer_name: 'Marco Reyes',
      customer_email: 'marco.reyes@example.com',
      contact_number: '+63 918 555 0202',
      delivery_address: '18 Taft Ave, Malate, Manila',
      payment_method: 'E-Wallet',
      order_notes: 'Call upon arrival',
      status: 'Pending',
      subtotal: 1210.0,
      total: 1210.0,
      stock_restored: false,
      created_at: now,
      updated_at: now,
    },
  ];

  const order_items: OrderItem[] = [
    {
      id: 'oi-demo-1',
      order_id: 'ord-demo-1',
      product_id: 'prod-01-2',
      product_name_snapshot: 'Removable Heart Model',
      specimen_code_snapshot: 'SP-01.2',
      unit_price_snapshot: 1650.0,
      quantity: 1,
      line_total: 1650.0,
    },
    {
      id: 'oi-demo-2',
      order_id: 'ord-demo-1',
      product_id: 'prod-02-1',
      product_name_snapshot: 'Borosilicate Beaker Set',
      specimen_code_snapshot: 'SP-02.1',
      unit_price_snapshot: 1250.0,
      quantity: 1,
      line_total: 1250.0,
    },
    {
      id: 'oi-demo-3',
      order_id: 'ord-demo-2',
      product_id: 'prod-03-1',
      product_name_snapshot: 'Prepared Microscope Slides',
      specimen_code_snapshot: 'SP-03.1',
      unit_price_snapshot: 890.0,
      quantity: 1,
      line_total: 890.0,
    },
    {
      id: 'oi-demo-4',
      order_id: 'ord-demo-2',
      product_id: 'prod-03-2',
      product_name_snapshot: 'Petri Dish Set',
      specimen_code_snapshot: 'SP-03.2',
      unit_price_snapshot: 320.0,
      quantity: 1,
      line_total: 320.0,
    },
  ];

  return { categories, products, orders, order_items };
}

function readDemoDb(): DemoDatabase {
  const dir = path.dirname(DEMO_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DEMO_DB_PATH)) {
    const initial = buildInitialDemoData();
    fs.writeFileSync(DEMO_DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DEMO_DB_PATH, 'utf8')) as DemoDatabase;
}

function writeDemoDb(db: DemoDatabase): void {
  const dir = path.dirname(DEMO_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DEMO_DB_PATH, JSON.stringify(db, null, 2));
}

export function getStorageMode(): 'supabase' | 'local-fallback' {
  return isSupabaseConfigured() ? 'supabase' : 'local-fallback';
}

// --- categories ---

export async function listCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: cats, error } = await supabase
      .from('categories')
      .select('*')
      .order('code', { ascending: true });
    if (error) throw new Error(error.message);

    const { data: prods } = await supabase
      .from('products')
      .select('id, category_id, is_active');

    const countMap = new Map<string, number>();
    for (const p of prods || []) {
      countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
    }

    return (cats || []).map((c) => ({
      ...c,
      product_count: countMap.get(c.id) || 0,
    }));
  }

  const db = readDemoDb();
  return db.categories
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((c) => ({
      ...c,
      product_count: db.products.filter((p) => p.category_id === c.id).length,
    }));
}

export async function createCategory(input: {
  name: string;
  description?: string;
}): Promise<Category> {
  const name = input.name.trim();
  if (!name) throw new Error('Category name is required.');

  const existing = await listCategories();
  if (existing.some((c) => c.name.trim().toLowerCase() === name.toLowerCase())) {
    throw new Error('A category with this name already exists.');
  }

  const nextNum = existing.length + 1;
  const code = String(nextNum).padStart(2, '0');
  const slug = slugify(name) || `category-${Date.now()}`;

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        code,
        name,
        slug,
        description: (input.description || '').trim(),
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return { ...data, product_count: 0 };
  }

  const db = readDemoDb();
  const cat: Category = {
    id: crypto.randomUUID(),
    code,
    name,
    slug,
    description: (input.description || '').trim(),
    created_at: new Date().toISOString(),
    product_count: 0,
  };
  db.categories.push(cat);
  writeDemoDb(db);
  return cat;
}

export async function updateCategory(
  id: string,
  input: { name: string; description?: string }
): Promise<Category> {
  const name = input.name.trim();
  if (!name) throw new Error('Category name is required.');

  const existing = await listCategories();
  if (
    existing.some(
      (c) => c.id !== id && c.name.trim().toLowerCase() === name.toLowerCase()
    )
  ) {
    throw new Error('Another category already uses that name.');
  }

  const slug = slugify(name);
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        description: (input.description || '').trim(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const db = readDemoDb();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Category not found.');
  db.categories[idx] = {
    ...db.categories[idx],
    name,
    slug,
    description: (input.description || '').trim(),
  };
  writeDemoDb(db);
  return db.categories[idx];
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { count, error: countErr } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);
    if (countErr) throw new Error(countErr.message);
    if ((count || 0) > 0) {
      throw new Error(
        `Cannot delete category because ${count} product(s) are still assigned to it. Reassign or delete those products first.`
      );
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }

  const db = readDemoDb();
  const count = db.products.filter((p) => p.category_id === id).length;
  if (count > 0) {
    throw new Error(
      `Cannot delete category because ${count} product(s) are still assigned to it. Reassign or delete those products first.`
    );
  }
  db.categories = db.categories.filter((c) => c.id !== id);
  writeDemoDb(db);
}

// --- products ---

export async function listProducts(options?: {
  activeOnly?: boolean;
}): Promise<Product[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('specimen_code', { ascending: true });
    if (options?.activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((p) => ({
      ...p,
      price: Number(p.price),
      stock: Number(p.stock),
    }));
  }

  const db = readDemoDb();
  const catMap = new Map(db.categories.map((c) => [c.id, c]));
  let items = db.products.map((p) => ({
    ...p,
    price: Number(p.price),
    stock: Number(p.stock),
    category: catMap.get(p.category_id) || null,
  }));
  if (options?.activeOnly) {
    items = items.filter((p) => p.is_active);
  }
  return items.sort((a, b) => a.specimen_code.localeCompare(b.specimen_code));
}

export async function getProductByIdOrSlug(
  idOrSlug: string,
  options?: { activeOnly?: boolean }
): Promise<Product | null> {
  const all = await listProducts(options);
  return (
    all.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null
  );
}

export async function createProduct(input: {
  specimen_code?: string;
  name: string;
  category_id: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
  is_featured?: boolean;
}): Promise<Product> {
  const name = input.name.trim();
  if (!name) throw new Error('Product name is required.');
  if (!input.category_id) throw new Error('Category is required.');

  const price = Number(input.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Price must be greater than zero.');
  }

  const stock = Number(input.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error('Stock must be a whole number of 0 or more.');
  }

  const existing = await listProducts();
  const specimenCode =
    (input.specimen_code || '').trim() ||
    `SP-${String(existing.length + 1).padStart(2, '0')}`;
  const slug = `${slugify(name)}-${Date.now().toString().slice(-4)}`;
  const imageUrl =
    input.image_url.trim() || '/images/products/borosilicate-beaker-set.jpg';

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        specimen_code: specimenCode,
        name,
        slug,
        category_id: input.category_id,
        description: input.description.trim(),
        price: Number(price.toFixed(2)),
        stock,
        image_url: imageUrl,
        is_active: Boolean(input.is_active),
        is_featured: Boolean(input.is_featured ?? true),
      })
      .select('*, category:categories(*)')
      .single();
    if (error) throw new Error(error.message);
    return { ...data, price: Number(data.price), stock: Number(data.stock) };
  }

  const db = readDemoDb();
  const now = new Date().toISOString();
  const prod: Product = {
    id: crypto.randomUUID(),
    specimen_code: specimenCode,
    name,
    slug,
    category_id: input.category_id,
    description: input.description.trim(),
    price: Number(price.toFixed(2)),
    stock,
    image_url: imageUrl,
    is_active: Boolean(input.is_active),
    is_featured: Boolean(input.is_featured ?? true),
    created_at: now,
    updated_at: now,
  };
  db.products.push(prod);
  writeDemoDb(db);
  return prod;
}

export async function updateProduct(
  id: string,
  input: {
    specimen_code?: string;
    name: string;
    category_id: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    is_active: boolean;
    is_featured?: boolean;
  }
): Promise<Product> {
  const name = input.name.trim();
  if (!name) throw new Error('Product name is required.');
  if (!input.category_id) throw new Error('Category is required.');

  const price = Number(input.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Price must be greater than zero.');
  }

  const stock = Number(input.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error('Stock must be a whole number of 0 or more.');
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const patch: Record<string, unknown> = {
      name,
      category_id: input.category_id,
      description: input.description.trim(),
      price: Number(price.toFixed(2)),
      stock,
      image_url:
        input.image_url.trim() || '/images/products/borosilicate-beaker-set.jpg',
      is_active: Boolean(input.is_active),
      updated_at: new Date().toISOString(),
    };
    if (input.specimen_code?.trim()) {
      patch.specimen_code = input.specimen_code.trim();
    }
    if (typeof input.is_featured === 'boolean') {
      patch.is_featured = input.is_featured;
    }

    const { data, error } = await supabase
      .from('products')
      .update(patch)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) throw new Error(error.message);
    return { ...data, price: Number(data.price), stock: Number(data.stock) };
  }

  const db = readDemoDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found.');
  db.products[idx] = {
    ...db.products[idx],
    specimen_code: input.specimen_code?.trim() || db.products[idx].specimen_code,
    name,
    category_id: input.category_id,
    description: input.description.trim(),
    price: Number(price.toFixed(2)),
    stock,
    image_url:
      input.image_url.trim() || '/images/products/borosilicate-beaker-set.jpg',
    is_active: Boolean(input.is_active),
    is_featured:
      typeof input.is_featured === 'boolean'
        ? input.is_featured
        : db.products[idx].is_featured,
    updated_at: new Date().toISOString(),
  };
  writeDemoDb(db);
  return db.products[idx];
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { count, error: refErr } = await supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', id);
    if (refErr) throw new Error(refErr.message);
    if ((count || 0) > 0) {
      throw new Error(
        'REFERENCED_IN_ORDER: This product is referenced by existing order history and cannot be deleted. Mark it inactive instead.'
      );
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }

  const db = readDemoDb();
  const isReferenced = db.order_items.some((oi) => oi.product_id === id);
  if (isReferenced) {
    throw new Error(
      'REFERENCED_IN_ORDER: This product is referenced by existing order history and cannot be deleted. Mark it inactive instead.'
    );
  }
  db.products = db.products.filter((p) => p.id !== id);
  writeDemoDb(db);
}

// --- orders ---

export async function listOrders(): Promise<Order[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (orders || []).map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      total: Number(o.total),
      items: (o.items || []).map((i: OrderItem) => ({
        ...i,
        unit_price_snapshot: Number(i.unit_price_snapshot),
        line_total: Number(i.line_total),
      })),
    }));
  }

  const db = readDemoDb();
  return db.orders
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      total: Number(o.total),
      items: db.order_items.filter((i) => i.order_id === o.id),
    }));
}

export async function getOrderByIdOrNumber(
  idOrNumber: string
): Promise<Order | null> {
  const all = await listOrders();
  return (
    all.find(
      (o) =>
        o.id === idOrNumber ||
        o.order_number.toLowerCase() === idOrNumber.toLowerCase()
    ) || null
  );
}

export async function createOrderFromCheckout(input: {
  customer_name: string;
  customer_email: string;
  contact_number: string;
  delivery_address: string;
  payment_method: PaymentMethod;
  order_notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    expectedPrice?: number;
  }>;
}): Promise<Order> {
  if (!input.items || input.items.length === 0) {
    throw new Error('Your cart is empty.');
  }

  const products = await listProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));

  // recheck availability, price, and stock against stored source
  const discrepancies: string[] = [];
  const verifiedLines: Array<{
    product: Product;
    quantity: number;
    lineTotal: number;
  }> = [];

  for (const reqItem of input.items) {
    const prod = productMap.get(reqItem.productId);
    if (!prod || !prod.is_active) {
      discrepancies.push(
        `"${prod?.name || reqItem.productId}" is no longer available.`
      );
      continue;
    }

    const qty = Math.floor(Number(reqItem.quantity));
    if (!Number.isInteger(qty) || qty <= 0) {
      discrepancies.push(`Invalid quantity for "${prod.name}".`);
      continue;
    }

    if (prod.stock < qty) {
      discrepancies.push(
        `"${prod.name}" only has ${prod.stock} unit(s) left in stock.`
      );
      continue;
    }

    if (
      typeof reqItem.expectedPrice === 'number' &&
      toCentavos(reqItem.expectedPrice) !== toCentavos(prod.price)
    ) {
      discrepancies.push(
        `Price for "${prod.name}" changed from PHP ${reqItem.expectedPrice.toFixed(2)} to PHP ${prod.price.toFixed(2)}.`
      );
      continue;
    }

    verifiedLines.push({
      product: prod,
      quantity: qty,
      lineTotal: calcLineTotal(prod.price, qty),
    });
  }

  if (discrepancies.length > 0) {
    throw new Error(`REVIEW_REQUIRED: ${discrepancies.join(' ')}`);
  }

  const totalCentavos = verifiedLines.reduce(
    (sum, line) => sum + toCentavos(line.lineTotal),
    0
  );
  const total = fromCentavos(totalCentavos);

  const existingOrders = await listOrders();
  const nextSeq = existingOrders.length + 1;
  const randSuffix = Math.floor(100 + Math.random() * 900);
  const orderNumber = `ORD-${String(nextSeq).padStart(4, '0')}-${randSuffix}`;

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: input.customer_name.trim(),
        customer_email: input.customer_email.trim().toLowerCase(),
        contact_number: input.contact_number.trim(),
        delivery_address: input.delivery_address.trim(),
        payment_method: input.payment_method,
        order_notes: (input.order_notes || '').trim(),
        status: 'Pending',
        subtotal: total,
        total,
        stock_restored: false,
      })
      .select('*')
      .single();

    if (orderErr) throw new Error(orderErr.message);

    const orderItemsPayload = verifiedLines.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      product_name_snapshot: line.product.name,
      specimen_code_snapshot: line.product.specimen_code,
      unit_price_snapshot: line.product.price,
      quantity: line.quantity,
      line_total: line.lineTotal,
    }));

    const { data: insertedItems, error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsPayload)
      .select('*');

    if (itemsErr) {
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(itemsErr.message);
    }

    // decrement stock for each ordered product
    for (const line of verifiedLines) {
      const nextStock = Math.max(0, line.product.stock - line.quantity);
      const { error: stockErr } = await supabase
        .from('products')
        .update({ stock: nextStock, updated_at: new Date().toISOString() })
        .eq('id', line.product.id);
      if (stockErr) throw new Error(stockErr.message);
    }

    return { ...order, items: insertedItems || [] };
  }

  const db = readDemoDb();
  const now = new Date().toISOString();
  const orderId = crypto.randomUUID();
  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_name: input.customer_name.trim(),
    customer_email: input.customer_email.trim().toLowerCase(),
    contact_number: input.contact_number.trim(),
    delivery_address: input.delivery_address.trim(),
    payment_method: input.payment_method,
    order_notes: (input.order_notes || '').trim(),
    status: 'Pending',
    subtotal: total,
    total,
    stock_restored: false,
    created_at: now,
    updated_at: now,
  };

  const newItems: OrderItem[] = verifiedLines.map((line) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: line.product.id,
    product_name_snapshot: line.product.name,
    specimen_code_snapshot: line.product.specimen_code,
    unit_price_snapshot: line.product.price,
    quantity: line.quantity,
    line_total: line.lineTotal,
  }));

  for (const line of verifiedLines) {
    const pIdx = db.products.findIndex((p) => p.id === line.product.id);
    if (pIdx !== -1) {
      db.products[pIdx].stock = Math.max(
        0,
        db.products[pIdx].stock - line.quantity
      );
      db.products[pIdx].updated_at = now;
    }
  }

  db.orders.push(newOrder);
  db.order_items.push(...newItems);
  writeDemoDb(db);

  return { ...newOrder, items: newItems };
}

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus
): Promise<Order> {
  const existing = await getOrderByIdOrNumber(orderId);
  if (!existing) throw new Error('Order not found.');

  if (!canTransitionOrderStatus(existing.status, nextStatus)) {
    throw new Error(
      `Invalid status transition from ${existing.status} to ${nextStatus}.`
    );
  }

  const restore = shouldRestoreStock(
    existing.status,
    nextStatus,
    existing.stock_restored
  );

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        status: nextStatus,
        stock_restored: restore ? true : existing.stock_restored,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*, items:order_items(*)')
      .single();

    if (error) throw new Error(error.message);

    if (restore && existing.items) {
      for (const item of existing.items) {
        if (!item.product_id) continue;
        const { data: prod } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();
        if (prod) {
          await supabase
            .from('products')
            .update({
              stock: Number(prod.stock) + item.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.product_id);
        }
      }
    }

    return updated;
  }

  const db = readDemoDb();
  const idx = db.orders.findIndex((o) => o.id === existing.id);
  if (idx === -1) throw new Error('Order not found.');

  const now = new Date().toISOString();
  db.orders[idx] = {
    ...db.orders[idx],
    status: nextStatus,
    stock_restored: restore ? true : db.orders[idx].stock_restored,
    updated_at: now,
  };

  if (restore) {
    const items = db.order_items.filter((i) => i.order_id === existing.id);
    for (const item of items) {
      if (!item.product_id) continue;
      const pIdx = db.products.findIndex((p) => p.id === item.product_id);
      if (pIdx !== -1) {
        db.products[pIdx].stock += item.quantity;
        db.products[pIdx].updated_at = now;
      }
    }
  }

  writeDemoDb(db);
  return {
    ...db.orders[idx],
    items: db.order_items.filter((i) => i.order_id === existing.id),
  };
}

// --- customers & dashboard stats ---

export async function listDerivedCustomers(): Promise<CustomerSummary[]> {
  const orders = await listOrders();
  // sort oldest -> newest first so latest submitted name/contact wins
  const chronological = orders
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const map = new Map<string, CustomerSummary>();
  for (const o of chronological) {
    const email = o.customer_email.trim().toLowerCase();
    const prev = map.get(email);
    const completedAdd =
      o.status === 'Completed' ? toCentavos(o.total) : 0;
    const prevCentavos = prev ? toCentavos(prev.total_completed_spent) : 0;

    map.set(email, {
      email,
      name: o.customer_name,
      contact_number: o.contact_number,
      order_count: (prev?.order_count || 0) + 1,
      last_order_date: o.created_at,
      total_completed_spent: fromCentavos(prevCentavos + completedAdd),
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    b.last_order_date.localeCompare(a.last_order_date)
  );
}

export async function getAdminOverviewStats() {
  const [products, categories, orders, customers] = await Promise.all([
    listProducts(),
    listCategories(),
    listOrders(),
    listDerivedCustomers(),
  ]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const actionOrders = orders.filter(
    (o) =>
      o.status === 'Pending' ||
      o.status === 'Confirmed' ||
      o.status === 'Preparing'
  ).length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;

  const monthlySalesCentavos = orders
    .filter((o) => {
      if (o.status === 'Cancelled') return false;
      const d = new Date(o.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, o) => sum + toCentavos(o.total), 0);

  const totalSalesCentavos = orders
    .filter((o) => o.status === 'Completed')
    .reduce((sum, o) => sum + toCentavos(o.total), 0);

  // build last 7 days revenue buckets ending today
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const last7DaysSales = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - idx));
    const key = d.toISOString().slice(0, 10);
    const dayCentavos = orders
      .filter((o) => {
        if (o.status === 'Cancelled') return false;
        return new Date(o.created_at).toISOString().slice(0, 10) === key;
      })
      .reduce((sum, o) => sum + toCentavos(o.total), 0);

    return {
      date: key,
      label: dayNames[d.getDay()],
      total: fromCentavos(dayCentavos),
    };
  });

  const lowStockProducts = products
    .filter((p) => p.is_active && p.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return {
    totalProducts: products.length,
    totalCategories: categories.length,
    totalOrders: orders.length,
    pendingOrders,
    actionOrders,
    completedOrders,
    totalCustomers: customers.length,
    totalSales: fromCentavos(totalSalesCentavos),
    monthlySales: fromCentavos(monthlySalesCentavos),
    last7DaysSales,
    lowStockProducts,
    recentOrders: orders.slice(0, 5),
  };
}
