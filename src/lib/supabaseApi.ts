/**
 * Supabase API service layer
 * Provides CRUD operations for all entities backed by Supabase tables.
 * 
 * NOTE: The Supabase generated types (types.ts) only include tables that currently
 * exist in the DB (profiles, user_roles, membership_tiers). Once the full migration
 * is applied (20260516120000_full_schema.sql), these queries will be fully type-safe.
 * For now, we use `as any` on `.from()` to avoid TS errors for tables not yet created.
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Image Upload ───────────────────────────────────────────────────────────

const BUCKET = "xus-assets";

/**
 * Upload a file to Supabase Storage and return the public URL.
 * Falls back to object URL if bucket does not exist.
 */
export async function uploadImage(file: File, folder: string = "products"): Promise<string> {
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.warn("[Upload] Storage error, using local URL:", error.message);
      return URL.createObjectURL(file);
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return urlData.publicUrl;
  } catch (e) {
    console.warn("[Upload] Unexpected error, using local URL:", e);
    return URL.createObjectURL(file);
  }
}

/**
 * Upload multiple files.
 */
export async function uploadImages(files: File[], folder: string = "products"): Promise<string[]> {
  return Promise.all(files.map((f) => uploadImage(f, folder)));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// Use `from` with type bypass until DB migration is applied
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ─── Categories ─────────────────────────────────────────────────────────────

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export async function fetchCategories(): Promise<CategoryRow[]> {
  try {
    const { data, error } = await db
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as CategoryRow[]) ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchCategories error:", e);
    return [];
  }
}

export async function createCategory(cat: Partial<CategoryRow>): Promise<CategoryRow | null> {
  try {
    const { data, error } = await db
      .from("categories")
      .insert(cat)
      .select()
      .single();
    if (error) throw error;
    return data as CategoryRow;
  } catch (e: unknown) {
    console.warn("[API] createCategory error:", e);
    return null;
  }
}

export async function updateCategory(id: string, updates: Partial<CategoryRow>): Promise<CategoryRow | null> {
  try {
    const { data, error } = await db
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as CategoryRow;
  } catch (e: unknown) {
    console.warn("[API] updateCategory error:", e);
    return null;
  }
}

export async function deleteCategoryApi(id: string): Promise<boolean> {
  try {
    const { error } = await db.from("categories").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (e: unknown) {
    console.warn("[API] deleteCategory error:", e);
    return false;
  }
}

// ─── Products ───────────────────────────────────────────────────────────────

export interface ProductRow {
  id: string;
  code: string;
  name: string;
  category_id: string | null;
  category_name: string;
  images: string[];
  description: string;
  supplier: string;
  cost_price: number;
  sale_price: number;
  expiry_date: string;
  stock: number;
  commission: number;
  stock_threshold: number;
  weight: string;
  dimension: string;
  storage: string;
  production: string;
  note: string;
  warehouse_type: "cold" | "normal";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchProducts(): Promise<ProductRow[]> {
  try {
    const { data, error } = await db
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ProductRow[]) ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchProducts error:", e);
    return [];
  }
}

export async function createProduct(product: Partial<ProductRow>): Promise<ProductRow | null> {
  try {
    const { data, error } = await db
      .from("products")
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data as ProductRow;
  } catch (e: unknown) {
    console.warn("[API] createProduct error:", e);
    return null;
  }
}

export async function updateProductApi(id: string, updates: Partial<ProductRow>): Promise<ProductRow | null> {
  try {
    const { data, error } = await db
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ProductRow;
  } catch (e: unknown) {
    console.warn("[API] updateProduct error:", e);
    return null;
  }
}

export async function deleteProductApi(id: string): Promise<boolean> {
  try {
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (e: unknown) {
    console.warn("[API] deleteProduct error:", e);
    return false;
  }
}

// ─── Customers ──────────────────────────────────────────────────────────────

export async function fetchCustomers() {
  try {
    const { data, error } = await db
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchCustomers error:", e);
    return [];
  }
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function fetchOrders() {
  try {
    const { data, error } = await db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchOrders error:", e);
    return [];
  }
}

// ─── Banners ────────────────────────────────────────────────────────────────

export async function fetchBanners() {
  try {
    const { data, error } = await db
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchBanners error:", e);
    return [];
  }
}

// ─── Vouchers ───────────────────────────────────────────────────────────────

export async function fetchVouchers() {
  try {
    const { data, error } = await db
      .from("vouchers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchVouchers error:", e);
    return [];
  }
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function fetchPosts() {
  try {
    const { data, error } = await db
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchPosts error:", e);
    return [];
  }
}

// ─── Warehouses ─────────────────────────────────────────────────────────────

export async function fetchWarehouses() {
  try {
    const { data, error } = await db
      .from("warehouses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchWarehouses error:", e);
    return [];
  }
}

// ─── Affiliates ─────────────────────────────────────────────────────────────

export async function fetchAffiliates() {
  try {
    const { data, error } = await db
      .from("affiliates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchAffiliates error:", e);
    return [];
  }
}

// ─── Promotions ─────────────────────────────────────────────────────────────

export async function fetchPromotions() {
  try {
    const { data, error } = await db
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchPromotions error:", e);
    return [];
  }
}

export async function createPromotion(payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("promotions").insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] createPromotion error:", e);
    return null;
  }
}

export async function updatePromotionApi(id: string, payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("promotions").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] updatePromotion error:", e);
    return null;
  }
}

export async function deletePromotionApi(id: string) {
  try {
    const { error } = await db.from("promotions").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (e: unknown) {
    console.warn("[API] deletePromotion error:", e);
    return false;
  }
}

// ─── Membership Tiers ────────────────────────────────────────────────────────

export async function fetchMembershipTiers() {
  try {
    const { data, error } = await db
      .from("membership_tiers")
      .select("*")
      .order("min_spent", { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchMembershipTiers error:", e);
    return [];
  }
}

export async function createMembershipTier(payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("membership_tiers").insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] createMembershipTier error:", e);
    return null;
  }
}

export async function updateMembershipTierApi(id: string, payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("membership_tiers").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] updateMembershipTier error:", e);
    return null;
  }
}

export async function deleteMembershipTierApi(id: string) {
  try {
    const { error } = await db.from("membership_tiers").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (e: unknown) {
    console.warn("[API] deleteMembershipTier error:", e);
    return false;
  }
}

// ─── B2B Customers ───────────────────────────────────────────────────────────

export async function fetchB2BCustomers() {
  try {
    const { data, error } = await db
      .from("b2b_customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchB2BCustomers error:", e);
    return [];
  }
}

export async function createB2BCustomer(payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("b2b_customers").insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] createB2BCustomer error:", e);
    return null;
  }
}

export async function updateB2BCustomerApi(id: string, payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("b2b_customers").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] updateB2BCustomer error:", e);
    return null;
  }
}

export async function deleteB2BCustomerApi(id: string) {
  try {
    const { error } = await db.from("b2b_customers").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (e: unknown) {
    console.warn("[API] deleteB2BCustomer error:", e);
    return false;
  }
}

// ─── B2B Orders ──────────────────────────────────────────────────────────────

export async function fetchB2BOrders() {
  try {
    const { data, error } = await db
      .from("b2b_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchB2BOrders error:", e);
    return [];
  }
}

export async function createB2BOrder(payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("b2b_orders").insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] createB2BOrder error:", e);
    return null;
  }
}

export async function updateB2BOrderApi(id: string, payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("b2b_orders").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] updateB2BOrder error:", e);
    return null;
  }
}

// ─── Red Invoices ────────────────────────────────────────────────────────────

export async function fetchRedInvoices() {
  try {
    const { data, error } = await db
      .from("red_invoices")
      .select("*")
      .order("issued_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: unknown) {
    console.warn("[API] fetchRedInvoices error:", e);
    return [];
  }
}

export async function createRedInvoice(payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("red_invoices").insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] createRedInvoice error:", e);
    return null;
  }
}

// ─── Orders (extended) ────────────────────────────────────────────────────────

export async function createOrder(payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("orders").insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] createOrder error:", e);
    return null;
  }
}

export async function updateOrderApi(id: string, payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("orders").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] updateOrder error:", e);
    return null;
  }
}

// ─── Customers (extended) ────────────────────────────────────────────────────

export async function createCustomer(payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("customers").insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] createCustomer error:", e);
    return null;
  }
}

export async function updateCustomerApi(id: string, payload: Record<string, unknown>) {
  try {
    const { data, error } = await db.from("customers").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  } catch (e: unknown) {
    console.warn("[API] updateCustomer error:", e);
    return null;
  }
}
