-- ============================================================
-- XUS FRESH HUB — Complete Database Schema
-- Creates all tables needed for the admin dashboard system
-- ============================================================

-- ───────────────────────────────────────────────────
-- Categories
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT DEFAULT 'Admin_Xus',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Products
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  supplier TEXT DEFAULT '',
  cost_price NUMERIC(12,2) DEFAULT 0,
  sale_price NUMERIC(12,2) DEFAULT 0,
  expiry_date DATE,
  stock INTEGER DEFAULT 0,
  commission NUMERIC(5,2) DEFAULT 0,
  stock_threshold INTEGER DEFAULT 0,
  weight TEXT DEFAULT '',
  dimension TEXT DEFAULT '',
  storage TEXT DEFAULT '',
  production TEXT DEFAULT '',
  note TEXT DEFAULT '',
  warehouse_type TEXT DEFAULT 'normal' CHECK (warehouse_type IN ('cold', 'normal')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Customers (B2C)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(14,2) DEFAULT 0,
  joined_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Warehouses
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  type TEXT DEFAULT 'normal' CHECK (type IN ('cold', 'normal')),
  manager TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Orders (B2C)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT DEFAULT '',
  items JSONB DEFAULT '[]',
  total NUMERIC(14,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','preparing','shipping','completed','cancelled')),
  handover_status TEXT CHECK (handover_status IN ('waiting', 'picked')),
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  shipping_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Stock Slips (Phiếu nhập/xuất/hủy/kiểm)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('import', 'export', 'destroy', 'audit')),
  warehouse_type TEXT DEFAULT 'normal',
  items JSONB DEFAULT '[]',
  total NUMERIC(14,2) DEFAULT 0,
  supplier TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  note TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Batches (Lô hàng)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT DEFAULT '',
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  location TEXT DEFAULT '',
  quantity INTEGER DEFAULT 0,
  production_date DATE,
  expiry_date DATE,
  cost_price NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Affiliates (CTV)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  sales NUMERIC(14,2) DEFAULT 0,
  commission NUMERIC(14,2) DEFAULT 0,
  joined_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Promotions (Khuyến mãi)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'combo' CHECK (type IN ('combo', 'bogo', 'gift')),
  product_ids TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  banner TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Banners
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  link TEXT DEFAULT '',
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  position TEXT DEFAULT 'home_hero' CHECK (position IN ('home_hero', 'home_strip', 'category_top')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Vouchers
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'percent' CHECK (type IN ('percent', 'fixed', 'shipping')),
  value NUMERIC(12,2) DEFAULT 0,
  min_order NUMERIC(12,2) DEFAULT 0,
  quota INTEGER DEFAULT 0,
  used INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Posts (Bài viết)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT DEFAULT '',
  category TEXT DEFAULT '',
  cover TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author TEXT DEFAULT '',
  published_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- B2B Customers
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.b2b_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  tax_code TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  bank_account TEXT,
  bank_name TEXT,
  contract_no TEXT,
  contract_start DATE,
  contract_end DATE,
  credit_limit NUMERIC(14,2) DEFAULT 0,
  debt NUMERIC(14,2) DEFAULT 0,
  price_tier TEXT DEFAULT 'wholesale_1' CHECK (price_tier IN ('wholesale_1', 'wholesale_2', 'wholesale_3')),
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- B2B Orders
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.b2b_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  b2b_customer_id UUID REFERENCES public.b2b_customers(id) ON DELETE SET NULL,
  company_name TEXT DEFAULT '',
  items JSONB DEFAULT '[]',
  subtotal NUMERIC(14,2) DEFAULT 0,
  vat_percent NUMERIC(5,2) DEFAULT 0,
  vat_amount NUMERIC(14,2) DEFAULT 0,
  total NUMERIC(14,2) DEFAULT 0,
  payment_term TEXT DEFAULT 'cash' CHECK (payment_term IN ('cash', '30days', '60days', '90days')),
  paid NUMERIC(14,2) DEFAULT 0,
  has_red_invoice BOOLEAN DEFAULT FALSE,
  red_invoice_no TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'delivered', 'paid', 'cancelled')),
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  created_by TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────
-- Red Invoices (Hóa đơn đỏ)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.red_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no TEXT NOT NULL,
  serial_no TEXT DEFAULT '',
  b2b_order_id UUID REFERENCES public.b2b_orders(id) ON DELETE SET NULL,
  b2b_customer_id UUID REFERENCES public.b2b_customers(id) ON DELETE SET NULL,
  company_name TEXT DEFAULT '',
  tax_code TEXT DEFAULT '',
  subtotal NUMERIC(14,2) DEFAULT 0,
  vat_percent NUMERIC(5,2) DEFAULT 0,
  vat_amount NUMERIC(14,2) DEFAULT 0,
  total NUMERIC(14,2) DEFAULT 0,
  issued_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'cancelled'))
);

-- ───────────────────────────────────────────────────
-- Storage bucket for assets
-- ───────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('xus-assets', 'xus-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read on the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
  USING (bucket_id = 'xus-assets');

-- Allow authenticated users to upload
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'xus-assets');

-- ───────────────────────────────────────────────────
-- RLS Policies (basic — allow all for authenticated)
-- ───────────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.red_invoices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (admin app)
DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'categories','products','customers','warehouses','orders',
    'stock_slips','batches','affiliates','promotions','banners',
    'vouchers','posts','b2b_customers','b2b_orders','red_invoices'
  ]) LOOP
    EXECUTE format(
      'CREATE POLICY "Auth full access" ON public.%I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')',
      tbl
    );
  END LOOP;
END $$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables that have it
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'categories','products','customers','warehouses','orders',
    'stock_slips','posts','b2b_customers','b2b_orders'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
      tbl
    );
  END LOOP;
END $$;
