import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  products as initialProducts,
  categories as initialCategories,
  orders as initialOrders,
  stockSlips as initialSlips,
  customers as initialCustomers,
  affiliates as initialAffiliates,
  promotions as initialPromos,
  warehouses as initialWarehouses,
  batches as initialBatches,
  roles as initialRoles,
  systemUsers as initialUsers,
  posts as initialPosts,
  memberships as initialMemberships,
  banners as initialBanners,
  vouchers as initialVouchers,
  b2bCustomers as initialB2BCustomers,
  b2bOrders as initialB2BOrders,
  redInvoices as initialRedInvoices,
  ADMIN_USER,
  type Product,
  type Category,
  type Order,
  type StockSlip,
  type Customer,
  type Affiliate,
  type Promotion,
  type OrderStatus,
  type Warehouse,
  type Batch,
  type Role,
  type RoleKey,
  type SystemUser,
  type Post,
  type MembershipTier,
  type Banner,
  type Voucher,
  type B2BCustomer,
  type B2BOrder,
  type RedInvoice,
} from "@/lib/mockData";

interface AppState {
  adminUser: string;
  currentRole: RoleKey;
  setCurrentRole: (r: RoleKey) => void;

  products: Product[];
  categories: Category[];
  customers: Customer[];
  affiliates: Affiliate[];
  orders: Order[];
  stockSlips: StockSlip[];
  promotions: Promotion[];
  warehouses: Warehouse[];
  batches: Batch[];
  roles: Role[];
  systemUsers: SystemUser[];
  posts: Post[];
  memberships: MembershipTier[];
  banners: Banner[];
  vouchers: Voucher[];
  b2bCustomers: B2BCustomer[];
  b2bOrders: B2BOrder[];
  redInvoices: RedInvoice[];

  addProduct: (p: Product) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addCategory: (c: Category) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addOrder: (o: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  setOrderWarehouse: (id: string, warehouseId: string) => void;
  setHandoverPicked: (id: string) => void;
  completeOrder: (id: string) => void;
  confirmOrder: (id: string) => void; // pending → preparing + FEFO deduct
  deleteOrder: (id: string) => void;

  addStockSlip: (s: StockSlip) => void;
  approveStockSlip: (id: string) => void;
  addBatch: (b: Batch) => void;
  adjustBatch: (id: string, delta: number) => void;

  approveAffiliate: (id: string) => void;
  rejectAffiliate: (id: string) => void;

  addPromotion: (p: Promotion) => void;

  addWarehouse: (w: Warehouse) => void;
  updateWarehouse: (id: string, w: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;

  addUser: (u: SystemUser) => void;
  updateUser: (id: string, u: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  togglePermission: (roleKey: RoleKey, permission: string) => void;

  addPost: (p: Post) => void;
  updatePost: (id: string, p: Partial<Post>) => void;
  deletePost: (id: string) => void;

  addBanner: (b: Banner) => void;
  deleteBanner: (id: string) => void;

  addVoucher: (v: Voucher) => void;
  updateVoucher: (id: string, v: Partial<Voucher>) => void;
  toggleVoucher: (id: string) => void;
  deleteVoucher: (id: string) => void;

  // Membership
  addMembership: (t: MembershipTier) => void;
  updateMembership: (id: string, t: Partial<MembershipTier>) => void;
  deleteMembership: (id: string) => void;

  // Promotions
  updatePromotion: (id: string, p: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;

  // B2B
  addB2BCustomer: (c: B2BCustomer) => void;
  updateB2BCustomer: (id: string, c: Partial<B2BCustomer>) => void;
  deleteB2BCustomer: (id: string) => void;

  addB2BOrder: (o: B2BOrder) => void;
  updateB2BOrderStatus: (id: string, status: B2BOrder["status"]) => void;
  recordB2BPayment: (id: string, amount: number) => void;
  issueRedInvoice: (b2bOrderId: string) => void;
  deleteB2BOrder: (id: string) => void;
}

// FEFO: deduct stock starting from earliest expiry
function deductFEFO(batches: Batch[], productId: string, qty: number): Batch[] {
  let remaining = qty;
  const sorted = [...(batches || [])]
    .filter((b) => b && b.productId === productId && b.quantity > 0)
    .sort((a, b) => {
      const timeA = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
      const timeB = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
      return timeA - timeB;
    });
  const updated = (batches || []).map((b) => ({ ...b }));
  for (const b of sorted) {
    if (remaining <= 0) break;
    const target = updated.find((x) => x && x.id === b.id);
    if (!target) continue;
    const take = Math.min(target.quantity, remaining);
    target.quantity -= take;
    remaining -= take;
  }
  return updated;
}

// Auto compute tier name based on totalSpent
function tierForSpent(tiers: MembershipTier[], spent: number): string {
  const sorted = [...tiers].sort((a, b) => b.minSpent - a.minSpent);
  return sorted.find((t) => spent >= t.minSpent)?.name ?? sorted[sorted.length - 1]?.name ?? "";
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      adminUser: ADMIN_USER,
  currentRole: "admin",
  setCurrentRole: (r) => set({ currentRole: r }),

  products: initialProducts,
  categories: initialCategories,
  customers: initialCustomers,
  affiliates: initialAffiliates,
  orders: initialOrders,
  stockSlips: initialSlips,
  promotions: initialPromos,
  warehouses: initialWarehouses,
  batches: initialBatches,
  roles: initialRoles,
  systemUsers: initialUsers,
  posts: initialPosts,
  memberships: initialMemberships,
  banners: initialBanners,
  vouchers: initialVouchers,
  b2bCustomers: initialB2BCustomers,
  b2bOrders: initialB2BOrders,
  redInvoices: initialRedInvoices,

  addProduct: (p) => {
    const state = get();
    // Auto-increment category productCount
    const updatedCategories = state.categories.map((c) =>
      c.name === p.category ? { ...c, productCount: c.productCount + 1 } : c,
    );
    set({ products: [p, ...state.products], categories: updatedCategories });
  },
  updateProduct: (id, p) =>
    set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
  deleteProduct: (id) => {
    const state = get();
    const product = state.products.find((x) => x.id === id);
    if (product) {
      const updatedCategories = state.categories.map((c) =>
        c.name === product.category ? { ...c, productCount: Math.max(0, c.productCount - 1) } : c,
      );
      set({ products: state.products.filter((x) => x.id !== id), categories: updatedCategories });
    } else {
      set({ products: state.products.filter((x) => x.id !== id) });
    }
  },

  addCategory: (c) => set((s) => ({ categories: [c, ...s.categories] })),
  updateCategory: (id, c) =>
    set((s) => ({ categories: s.categories.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
  deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

  addCustomer: (c) => set((s) => ({ customers: [c, ...s.customers] })),
  updateCustomer: (id, c) =>
    set((s) => ({ customers: s.customers.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
  deleteCustomer: (id) => set((s) => ({ customers: s.customers.filter((x) => x.id !== id) })),

  addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
  deleteOrder: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
  updateOrderStatus: (id, status) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id
          ? { ...o, status, handoverStatus: status === "preparing" ? "waiting" : o.handoverStatus }
          : o,
      ),
    })),
  setOrderWarehouse: (id, warehouseId) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, warehouseId } : o)),
    })),
  setHandoverPicked: (id) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, handoverStatus: "picked", status: "shipping" } : o,
      ),
    })),
  completeOrder: (id) => {
    const state = get();
    const order = state.orders.find((o) => o.id === id);
    if (!order) return;
    // update customer totalSpent + totalOrders
    const updatedCustomers = state.customers.map((c) =>
      c.id === order.customerId
        ? { ...c, totalSpent: c.totalSpent + order.total, totalOrders: c.totalOrders + 1 }
        : c,
    );
    set({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status: "completed" } : o)),
      customers: updatedCustomers,
    });
  },
  confirmOrder: (id) => {
    const state = get();
    const order = state.orders.find((o) => o.id === id);
    if (!order) return;
    let newBatches = state.batches;
    let newProducts = state.products;
    for (const item of order.items) {
      newBatches = deductFEFO(newBatches, item.productId, item.quantity);
      newProducts = newProducts.map((p) =>
        p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p,
      );
    }
    set({
      batches: newBatches,
      products: newProducts,
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status: "preparing", handoverStatus: "waiting" } : o,
      ),
    });
  },

  addStockSlip: (slip) => {
    const state = get();
    set({ stockSlips: [slip, ...state.stockSlips] });
    // if import slip - increase product stock
    if (slip.type === "import" && slip.status === "approved") {
      const newProducts = state.products.map((p) => {
        const item = slip.items.find((i) => i.productId === p.id);
        return item ? { ...p, stock: p.stock + item.quantity } : p;
      });
      set({ products: newProducts });
    }
  },
  approveStockSlip: (id) => {
    const state = get();
    const slip = state.stockSlips.find((x) => x.id === id);
    if (!slip) return;
    let newProducts = state.products;
    if (slip.type === "import") {
      newProducts = state.products.map((p) => {
        const item = slip.items.find((i) => i.productId === p.id);
        return item ? { ...p, stock: p.stock + item.quantity } : p;
      });
    } else if (slip.type === "export" || slip.type === "destroy") {
      newProducts = state.products.map((p) => {
        const item = slip.items.find((i) => i.productId === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
      });
    }
    set({
      stockSlips: state.stockSlips.map((x) => (x.id === id ? { ...x, status: "approved" } : x)),
      products: newProducts,
    });
  },
  addBatch: (b) => {
    const state = get();
    set({
      batches: [b, ...state.batches],
      products: state.products.map((p) =>
        p.id === b.productId ? { ...p, stock: p.stock + b.quantity } : p,
      ),
    });
  },
  adjustBatch: (id, delta) =>
    set((s) => ({
      batches: s.batches.map((b) =>
        b.id === id ? { ...b, quantity: Math.max(0, b.quantity + delta) } : b,
      ),
    })),

  approveAffiliate: (id) =>
    set((s) => ({
      affiliates: s.affiliates.map((a) => (a.id === id ? { ...a, status: "approved" } : a)),
    })),
  rejectAffiliate: (id) =>
    set((s) => ({
      affiliates: s.affiliates.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)),
    })),

  addPromotion: (p) => set((s) => ({ promotions: [p, ...s.promotions] })),

  addWarehouse: (w) => set((s) => ({ warehouses: [w, ...s.warehouses] })),
  updateWarehouse: (id, w) =>
    set((s) => ({ warehouses: s.warehouses.map((x) => (x.id === id ? { ...x, ...w } : x)) })),
  deleteWarehouse: (id) => set((s) => ({ warehouses: s.warehouses.filter((w) => w.id !== id) })),

  addUser: (u) => set((s) => ({ systemUsers: [u, ...s.systemUsers] })),
  updateUser: (id, u) =>
    set((s) => ({ systemUsers: s.systemUsers.map((x) => (x.id === id ? { ...x, ...u } : x)) })),
  deleteUser: (id) => set((s) => ({ systemUsers: s.systemUsers.filter((u) => u.id !== id) })),
  togglePermission: (roleKey, permission) =>
    set((s) => ({
      roles: s.roles.map((r) =>
        r.key === roleKey
          ? {
              ...r,
              permissions: r.permissions.includes(permission)
                ? r.permissions.filter((p) => p !== permission)
                : [...r.permissions, permission],
            }
          : r,
      ),
    })),

  addPost: (p) => set((s) => ({ posts: [p, ...s.posts] })),
  updatePost: (id, p) =>
    set((s) => ({ posts: s.posts.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
  deletePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),

  addBanner: (b) => set((s) => ({ banners: [b, ...s.banners] })),
  deleteBanner: (id) => set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),

  addVoucher: (v) => set((s) => ({ vouchers: [v, ...s.vouchers] })),
  updateVoucher: (id, v) =>
    set((s) => ({ vouchers: s.vouchers.map((x) => (x.id === id ? { ...x, ...v } : x)) })),
  toggleVoucher: (id) =>
    set((s) => ({
      vouchers: s.vouchers.map((v) => (v.id === id ? { ...v, active: !v.active } : v)),
    })),
  deleteVoucher: (id) => set((s) => ({ vouchers: s.vouchers.filter((v) => v.id !== id) })),

  // Membership CRUD
  addMembership: (t) => set((s) => ({ memberships: [...s.memberships, t] })),
  updateMembership: (id, t) =>
    set((s) => ({ memberships: s.memberships.map((x) => (x.id === id ? { ...x, ...t } : x)) })),
  deleteMembership: (id) => set((s) => ({ memberships: s.memberships.filter((m) => m.id !== id) })),

  // Promotion CRUD
  updatePromotion: (id, p) =>
    set((s) => ({ promotions: s.promotions.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
  deletePromotion: (id) => set((s) => ({ promotions: s.promotions.filter((p) => p.id !== id) })),

  // B2B
  addB2BCustomer: (c) => set((s) => ({ b2bCustomers: [c, ...s.b2bCustomers] })),
  updateB2BCustomer: (id, c) =>
    set((s) => ({ b2bCustomers: s.b2bCustomers.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
  deleteB2BCustomer: (id) =>
    set((s) => ({ b2bCustomers: s.b2bCustomers.filter((x) => x.id !== id) })),

  addB2BOrder: (o) => {
    const state = get();
    set({ b2bOrders: [o, ...state.b2bOrders] });
    // update b2b customer stats
    set({
      b2bCustomers: state.b2bCustomers.map((c) =>
        c.id === o.b2bCustomerId
          ? {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + o.total,
              debt: c.debt + (o.total - o.paid),
            }
          : c,
      ),
    });
  },
  updateB2BOrderStatus: (id, status) => {
    const state = get();
    const order = state.b2bOrders.find((o) => o.id === id);
    if (!order) return;
    // when confirmed → FEFO deduct
    if (status === "confirmed" && order.status === "draft") {
      let newBatches = state.batches;
      let newProducts = state.products;
      for (const item of order.items) {
        newBatches = deductFEFO(newBatches, item.productId, item.quantity);
        newProducts = newProducts.map((p) =>
          p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p,
        );
      }
      set({ batches: newBatches, products: newProducts });
    }
    set({
      b2bOrders: state.b2bOrders.map((o) => (o.id === id ? { ...o, status } : o)),
    });
  },
  recordB2BPayment: (id, amount) => {
    const state = get();
    const order = state.b2bOrders.find((o) => o.id === id);
    if (!order) return;
    const newPaid = order.paid + amount;
    set({
      b2bOrders: state.b2bOrders.map((o) =>
        o.id === id ? { ...o, paid: newPaid, status: newPaid >= o.total ? "paid" : o.status } : o,
      ),
      b2bCustomers: state.b2bCustomers.map((c) =>
        c.id === order.b2bCustomerId ? { ...c, debt: Math.max(0, c.debt - amount) } : c,
      ),
    });
  },
  issueRedInvoice: (b2bOrderId) => {
    const state = get();
    const order = state.b2bOrders.find((o) => o.id === b2bOrderId);
    if (!order) return;
    const customer = state.b2bCustomers.find((c) => c.id === order.b2bCustomerId);
    if (!customer) return;
    const invoiceNo = String(state.redInvoices.length + 1).padStart(7, "0");
    const newInv: RedInvoice = {
      id: `ri-${Date.now()}`,
      invoiceNo,
      serialNo: "1C25TXX",
      b2bOrderId,
      b2bCustomerId: order.b2bCustomerId,
      companyName: customer.companyName,
      taxCode: customer.taxCode,
      subtotal: order.subtotal,
      vatPercent: order.vatPercent,
      vatAmount: order.vatAmount,
      total: order.total,
      issuedAt: new Date().toISOString(),
      status: "issued",
    };
    set({
      redInvoices: [newInv, ...state.redInvoices],
      b2bOrders: state.b2bOrders.map((o) =>
        o.id === b2bOrderId ? { ...o, hasRedInvoice: true, redInvoiceNo: invoiceNo } : o,
      ),
    });
  },
    deleteB2BOrder: (id) => set((s) => ({ b2bOrders: s.b2bOrders.filter((o) => o.id !== id) })),
  }),
  {
    name: "fresh-hub-db-v2", // Updated key to force a clean reset of corrupted local storage data
  }
));

// Helper exports
export { tierForSpent };
