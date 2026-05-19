// Mock data for Xus admin dashboard

export type WarehouseType = "cold" | "normal";
export type OrderStatus = "pending" | "preparing" | "shipping" | "completed" | "cancelled";
export type HandoverStatus = "waiting" | "picked";
export type AffiliateStatus = "pending" | "approved" | "rejected";
export type StockSlipStatus = "draft" | "approved";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  image?: string;
  createdBy: string;
  productCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  images: string[];
  description: string;
  supplier: string;
  costPrice: number;
  salePrice: number;
  productionDate: string;  // ngày sản xuất
  expiryDate: string;      // hạn sử dụng (thường 30 hoặc 60 ngày sau SX)
  stock: number;
  commission: number;
  stockThreshold: number;
  weight: string;
  dimension: string;
  storage: string;
  production: string;
  note: string;
  warehouseType: WarehouseType;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
}

export interface Affiliate {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: AffiliateStatus;
  sales: number;
  commission: number;
  joinedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  batchCode?: string;
  productionDate?: string;
  expiryDate?: string;
}

export interface Order {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  handoverStatus?: HandoverStatus;
  warehouseId?: string;
  createdAt: string;
  shippingAddress: string;
}

export interface StockSlip {
  id: string;
  code: string;
  type: "import" | "export" | "destroy" | "audit";
  warehouseType: WarehouseType;
  items: { 
    productId: string; 
    productName: string; 
    quantity: number; 
    price: number;
    batchCode?: string;
    productionDate?: string;
    expiryDate?: string;
  }[];
  total: number;
  supplier?: string;
  createdBy: string;
  note: string;
  status: StockSlipStatus;
  createdAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: "combo" | "bogo" | "gift";
  productIds: string[];
  startDate: string;
  endDate: string;
  banner?: string;
  active: boolean;
}

// ===== NEW domain =====
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  type: WarehouseType;
  manager: string;
  active: boolean;
}

export interface Batch {
  id: string;
  code: string; // mã lô
  productId: string;
  productName: string;
  warehouseId: string;
  location: string; // Khu A - Kệ 03
  quantity: number;
  productionDate: string;
  expiryDate: string;
  costPrice: number;
  createdAt: string;
}

export type RoleKey =
  | "admin"
  | "warehouse_manager"
  | "warehouse_staff"
  | "marketing"
  | "accountant";

export interface Role {
  key: RoleKey;
  name: string;
  description: string;
  permissions: string[]; // permission keys
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleKey;
  active: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  cover: string;
  excerpt: string;
  status: "draft" | "published";
  author: string;
  publishedAt: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  minSpent: number;
  discount: number; // %
  perks: string[];
  color: string;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  promotionId?: string;
  startDate: string;
  endDate: string;
  position: "home_hero" | "home_strip" | "category_top";
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minOrder: number;
  quota: number;
  used: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

// ===== B2B =====
export interface B2BCustomer {
  id: string;
  code: string;
  companyName: string;
  taxCode: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  bankAccount?: string;
  bankName?: string;
  contractNo?: string;
  contractStart?: string;
  contractEnd?: string;
  creditLimit: number; // hạn mức công nợ
  debt: number; // công nợ hiện tại
  priceTier: "wholesale_1" | "wholesale_2" | "wholesale_3";
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface B2BOrder {
  id: string;
  code: string;
  b2bCustomerId: string;
  companyName: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  subtotal: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
  paymentTerm: "cash" | "30days" | "60days" | "90days";
  paid: number;
  hasRedInvoice: boolean;
  redInvoiceNo?: string;
  status: "draft" | "confirmed" | "delivered" | "paid" | "cancelled";
  warehouseId?: string;
  createdBy: string;
  note: string;
  createdAt: string;
}

export interface RedInvoice {
  id: string;
  invoiceNo: string; // số hóa đơn
  serialNo: string; // ký hiệu
  b2bOrderId: string;
  b2bCustomerId: string;
  companyName: string;
  taxCode: string;
  subtotal: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
  issuedAt: string;
  status: "issued" | "cancelled";
}

export const categories: Category[] = [
  { id: "c1", name: "Rau ăn lá", createdBy: "Admin_Xus", productCount: 8, createdAt: "2025-01-10" },
  { id: "c2", name: "Củ quả", createdBy: "Admin_Xus", productCount: 6, createdAt: "2025-01-12" },
  {
    id: "c3",
    name: "Trái cây nhập khẩu",
    createdBy: "Admin_Xus",
    productCount: 5,
    createdAt: "2025-01-15",
  },
  {
    id: "c4",
    name: "Trái cây nội địa",
    createdBy: "Admin_Xus",
    productCount: 7,
    createdAt: "2025-02-01",
  },
  {
    id: "c5",
    name: "Rau gia vị",
    createdBy: "Admin_Xus",
    productCount: 4,
    createdAt: "2025-02-05",
  },
];

const productImg = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?w=400&h=400&fit=crop`;

export const products: Product[] = [
  {
    id: "p1",
    code: "XUS-RAU-001",
    name: "Cải bó xôi hữu cơ 300g",
    category: "Rau ăn lá",
    images: [productImg("1576045057995-568f588f82fb"), productImg("1540420773420-3366772f4999")],
    description: "Cải bó xôi tươi, trồng theo phương pháp hữu cơ.",
    supplier: "Nông trại Đà Lạt",
    costPrice: 15000,
    salePrice: 25000,
    productionDate: "2026-05-11",
    expiryDate: "2025-05-15",
    stock: 120,
    commission: 8,
    stockThreshold: 30,
    weight: "300g",
    dimension: "20x15x5cm",
    storage: "Bảo quản 2-8°C",
    production: "Đà Lạt, Lâm Đồng",
    note: "Rửa sạch trước khi dùng",
    warehouseType: "cold",
  },
  {
    id: "p2",
    code: "XUS-TRC-002",
    name: "Táo Envy New Zealand 1kg",
    category: "Trái cây nhập khẩu",
    images: [productImg("1568702846914-96b305d2aaeb")],
    description: "Táo Envy nhập khẩu, ngọt giòn.",
    supplier: "NK Hoàng Gia",
    costPrice: 95000,
    salePrice: 145000,
    productionDate: "2025-05-21",
    expiryDate: "2025-06-20",
    stock: 80,
    commission: 10,
    stockThreshold: 20,
    weight: "1kg",
    dimension: "25x20x10cm",
    storage: "Bảo quản nơi khô ráo",
    production: "New Zealand",
    note: "",
    warehouseType: "normal",
  },
  {
    id: "p3",
    code: "XUS-CUQ-003",
    name: "Cà rốt Đà Lạt 500g",
    category: "Củ quả",
    images: [productImg("1598170845058-32b9d6a5da37")],
    description: "Cà rốt tươi Đà Lạt.",
    supplier: "Nông trại Đà Lạt",
    costPrice: 12000,
    salePrice: 22000,
    productionDate: "2025-03-31",
    expiryDate: "2026-04-26",
    stock: 200,
    commission: 7,
    stockThreshold: 50,
    weight: "500g",
    dimension: "25x10x8cm",
    storage: "Bảo quản 2-8°C",
    production: "Đà Lạt, Lâm Đồng",
    note: "",
    warehouseType: "cold",
  },
  {
    id: "p4",
    code: "XUS-TRC-004",
    name: "Xoài cát Hòa Lộc 1kg",
    category: "Trái cây nội địa",
    images: [productImg("1605027990121-cbae9e0642db")],
    description: "Xoài cát Hòa Lộc đặc sản miền Tây.",
    supplier: "HTX Tiền Giang",
    costPrice: 45000,
    salePrice: 75000,
    productionDate: "2025-03-26",
    expiryDate: "2026-05-01",
    stock: 60,
    commission: 9,
    stockThreshold: 15,
    weight: "1kg",
    dimension: "30x20x10cm",
    storage: "Nhiệt độ phòng",
    production: "Tiền Giang",
    note: "",
    warehouseType: "normal",
  },
  {
    id: "p5",
    code: "XUS-RAU-005",
    name: "Xà lách Romaine 250g",
    category: "Rau ăn lá",
    images: [productImg("1622206151226-18ca2c9ab4a1")],
    description: "Xà lách Romaine giòn ngọt.",
    supplier: "Nông trại Đà Lạt",
    costPrice: 13000,
    salePrice: 23000,
    productionDate: "2025-03-23",
    expiryDate: "2026-05-04",
    stock: 90,
    commission: 8,
    stockThreshold: 25,
    weight: "250g",
    dimension: "25x10x8cm",
    storage: "Bảo quản 2-8°C",
    production: "Đà Lạt, Lâm Đồng",
    note: "",
    warehouseType: "cold",
  },
  {
    id: "p6",
    code: "XUS-RAU-006",
    name: "Bông cải xanh 400g",
    category: "Củ quả",
    images: [productImg("1583663848692-c3e2a1eb6c1e")],
    description: "Bông cải xanh tươi.",
    supplier: "Nông trại Đà Lạt",
    costPrice: 18000,
    salePrice: 32000,
    productionDate: "2026-05-16",
    expiryDate: "2025-05-10",
    stock: 110,
    commission: 8,
    stockThreshold: 30,
    weight: "400g",
    dimension: "20x15x10cm",
    storage: "Bảo quản 2-8°C",
    production: "Đà Lạt, Lâm Đồng",
    note: "",
    warehouseType: "cold",
  },
  {
    id: "p7",
    code: "XUS-TRC-007",
    name: "Nho đen không hạt 500g",
    category: "Trái cây nhập khẩu",
    images: [productImg("1599819811279-d5ad9cccf838")],
    description: "Nho đen Mỹ không hạt.",
    supplier: "NK Hoàng Gia",
    costPrice: 85000,
    salePrice: 135000,
    productionDate: "2025-04-05",
    expiryDate: "2025-05-05",
    stock: 70,
    commission: 10,
    stockThreshold: 20,
    weight: "500g",
    dimension: "20x15x8cm",
    storage: "Bảo quản 2-8°C",
    production: "USA",
    note: "",
    warehouseType: "cold",
  },
  {
    id: "p8",
    code: "XUS-GVI-008",
    name: "Húng quế 100g",
    category: "Rau gia vị",
    images: [productImg("1600326145552-327c4df2c246")],
    description: "Húng quế tươi.",
    supplier: "Nông trại Đà Lạt",
    costPrice: 8000,
    salePrice: 15000,
    productionDate: "2025-03-22",
    expiryDate: "2026-05-05",
    stock: 40,
    commission: 5,
    stockThreshold: 20,
    weight: "100g",
    dimension: "15x10x5cm",
    storage: "Bảo quản 2-8°C",
    production: "Đà Lạt, Lâm Đồng",
    note: "",
    warehouseType: "cold",
  },
];

export const customers: Customer[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `cu${i + 1}`,
  name: [
    "Nguyễn Văn An",
    "Trần Thị Bình",
    "Lê Hoàng Cường",
    "Phạm Thu Dung",
    "Hoàng Minh Em",
    "Vũ Thị Phương",
    "Đỗ Quốc Hùng",
    "Bùi Thanh Hà",
    "Ngô Văn Khoa",
    "Lý Mai Lan",
  ][i],
  phone: `09${10000000 + i * 1234567}`.slice(0, 10),
  email: `customer${i + 1}@xus.vn`,
  address: [
    "123 Lê Lợi, Q1, TPHCM",
    "45 Trần Hưng Đạo, Hà Nội",
    "78 Nguyễn Huệ, Đà Nẵng",
    "12 Hai Bà Trưng, Huế",
    "56 Lý Thường Kiệt, Cần Thơ",
    "89 Phan Chu Trinh, Hải Phòng",
    "34 Võ Văn Tần, TPHCM",
    "67 Bà Triệu, Hà Nội",
    "90 Trần Phú, Nha Trang",
    "21 Lê Duẩn, Vũng Tàu",
  ][i],
  totalOrders: Math.floor(Math.random() * 20) + 1,
  totalSpent: (Math.floor(Math.random() * 50) + 5) * 100000,
  joinedAt: "2025-01-15",
}));

export const affiliates: Affiliate[] = [
  {
    id: "a1",
    name: "Phạm Thị Xuân",
    phone: "0901234567",
    email: "xuan@ctv.xus.vn",
    status: "approved",
    sales: 12500000,
    commission: 1250000,
    joinedAt: "2025-01-20",
  },
  {
    id: "a2",
    name: "Lê Văn Hòa",
    phone: "0902345678",
    email: "hoa@ctv.xus.vn",
    status: "approved",
    sales: 8200000,
    commission: 820000,
    joinedAt: "2025-02-01",
  },
  {
    id: "a3",
    name: "Trần Minh Tú",
    phone: "0903456789",
    email: "tu@ctv.xus.vn",
    status: "pending",
    sales: 0,
    commission: 0,
    joinedAt: "2026-05-16",
  },
  {
    id: "a4",
    name: "Nguyễn Thanh Hằng",
    phone: "0904567890",
    email: "hang@ctv.xus.vn",
    status: "pending",
    sales: 0,
    commission: 0,
    joinedAt: "2026-05-14",
  },
  {
    id: "a5",
    name: "Đỗ Quang Vinh",
    phone: "0905678901",
    email: "vinh@ctv.xus.vn",
    status: "rejected",
    sales: 0,
    commission: 0,
    joinedAt: "2025-03-15",
  },
];

export const orders: Order[] = [
  {
    id: "o1",
    code: "XUS-DH-0001",
    customerId: "cu1",
    customerName: customers[0].name,
    items: [
      { productId: "p1", productName: products[0].name, quantity: 2, price: 25000 },
      { productId: "p3", productName: products[2].name, quantity: 1, price: 22000 },
    ],
    total: 72000,
    status: "pending",
    createdAt: "2026-05-06T08:30:00Z",
    shippingAddress: customers[0].address,
  },
  {
    id: "o2",
    code: "XUS-DH-0002",
    customerId: "cu2",
    customerName: customers[1].name,
    items: [{ productId: "p2", productName: products[1].name, quantity: 1, price: 145000 }],
    total: 145000,
    status: "pending",
    createdAt: "2026-05-06T09:15:00Z",
    shippingAddress: customers[1].address,
  },
  {
    id: "o3",
    code: "XUS-DH-0003",
    customerId: "cu3",
    customerName: customers[2].name,
    items: [{ productId: "p4", productName: products[3].name, quantity: 2, price: 75000 }],
    total: 150000,
    status: "preparing",
    handoverStatus: "waiting",
    createdAt: "2026-05-07T14:00:00Z",
    shippingAddress: customers[2].address,
  },
  {
    id: "o4",
    code: "XUS-DH-0004",
    customerId: "cu4",
    customerName: customers[3].name,
    items: [
      { productId: "p7", productName: products[6].name, quantity: 1, price: 135000 },
      { productId: "p8", productName: products[7].name, quantity: 2, price: 15000 },
    ],
    total: 165000,
    status: "shipping",
    handoverStatus: "picked",
    createdAt: "2026-05-08T10:30:00Z",
    shippingAddress: customers[3].address,
  },
  {
    id: "o5",
    code: "XUS-DH-0005",
    customerId: "cu5",
    customerName: customers[4].name,
    items: [{ productId: "p5", productName: products[4].name, quantity: 3, price: 23000 }],
    total: 69000,
    status: "completed",
    createdAt: "2026-05-11T16:20:00Z",
    shippingAddress: customers[4].address,
  },
  {
    id: "o6",
    code: "XUS-DH-0006",
    customerId: "cu6",
    customerName: customers[5].name,
    items: [{ productId: "p6", productName: products[5].name, quantity: 1, price: 32000 }],
    total: 32000,
    status: "cancelled",
    createdAt: "2026-05-12T11:10:00Z",
    shippingAddress: customers[5].address,
  },
];

export const stockSlips: StockSlip[] = [
  {
    id: "s1",
    code: "PN-2025-0001",
    type: "import",
    warehouseType: "cold",
    items: [{ productId: "p1", productName: products[0].name, quantity: 100, price: 15000 }],
    total: 1500000,
    supplier: "Nông trại Đà Lạt",
    createdBy: "Admin_Xus",
    note: "Nhập hàng định kỳ",
    status: "approved",
    createdAt: "2026-05-11",
  },
  {
    id: "s2",
    code: "PN-2025-0002",
    type: "import",
    warehouseType: "normal",
    items: [{ productId: "p2", productName: products[1].name, quantity: 50, price: 95000 }],
    total: 4750000,
    supplier: "NK Hoàng Gia",
    createdBy: "Admin_Xus",
    note: "",
    status: "draft",
    createdAt: "2026-05-07",
  },
  {
    id: "s3",
    code: "PX-2025-0001",
    type: "export",
    warehouseType: "cold",
    items: [{ productId: "p3", productName: products[2].name, quantity: 30, price: 12000 }],
    total: 360000,
    createdBy: "Admin_Xus",
    note: "Xuất theo đơn",
    status: "approved",
    createdAt: "2026-05-08",
  },
];

export const promotions: Promotion[] = [
  {
    id: "pr1",
    name: "Combo Salad tươi mát",
    type: "combo",
    productIds: ["p1", "p5"],
    startDate: "2026-05-11",
    endDate: "2025-05-15",
    active: true,
  },
  {
    id: "pr2",
    name: "Mua táo tặng nho",
    type: "bogo",
    productIds: ["p2", "p7"],
    startDate: "2026-05-06",
    endDate: "2026-04-26",
    active: true,
  },
];

// Revenue chart data
export const weeklyRevenue = [
  { day: "T2", revenue: 4200000 },
  { day: "T3", revenue: 5800000 },
  { day: "T4", revenue: 4900000 },
  { day: "T5", revenue: 6500000 },
  { day: "T6", revenue: 8200000 },
  { day: "T7", revenue: 9800000 },
  { day: "CN", revenue: 7600000 },
];

export const categoryShare = [
  { name: "Rau ăn lá", value: 35 },
  { name: "Trái cây nhập khẩu", value: 28 },
  { name: "Củ quả", value: 18 },
  { name: "Trái cây nội địa", value: 14 },
  { name: "Rau gia vị", value: 5 },
];

export const ADMIN_USER = "Admin_Xus";

// ===== Warehouses (2 kho) =====
export const warehouses: Warehouse[] = [
  {
    id: "wh1",
    code: "KHO-HCM",
    name: "Kho Trung tâm HCM",
    address: "Số 12 Lê Văn Lương, Q.7, TP.HCM",
    type: "cold",
    manager: "Trần Văn Kho",
    active: true,
  },
  {
    id: "wh2",
    code: "KHO-HN",
    name: "Kho Bắc Hà Nội",
    address: "KCN Sài Đồng, Long Biên, Hà Nội",
    type: "normal",
    manager: "Nguyễn Thị Quản",
    active: true,
  },
];

// ===== Batches (lô hàng) =====
export const batches: Batch[] = [
  {
    id: "b1",
    code: "LOT-2025-04-001",
    productId: "p1",
    productName: products[0].name,
    warehouseId: "wh1",
    location: "Khu A - Kệ 02",
    quantity: 80,
    productionDate: "2026-05-16",
    expiryDate: "2025-05-15",
    costPrice: 15000,
    createdAt: "2026-05-16",
  },
  {
    id: "b2",
    code: "LOT-2025-04-002",
    productId: "p1",
    productName: products[0].name,
    warehouseId: "wh2",
    location: "Khu B - Kệ 01",
    quantity: 40,
    productionDate: "2026-05-11",
    expiryDate: "2025-05-20",
    costPrice: 15500,
    createdAt: "2026-05-11",
  },
  {
    id: "b3",
    code: "LOT-2025-03-101",
    productId: "p2",
    productName: products[1].name,
    warehouseId: "wh1",
    location: "Khu C - Kệ 05",
    quantity: 50,
    productionDate: "2025-03-20",
    expiryDate: "2025-06-20",
    costPrice: 95000,
    createdAt: "2025-03-25",
  },
  {
    id: "b4",
    code: "LOT-2026-05-061",
    productId: "p3",
    productName: products[2].name,
    warehouseId: "wh1",
    location: "Khu A - Kệ 04",
    quantity: 120,
    productionDate: "2025-04-05",
    expiryDate: "2026-04-26",
    costPrice: 12000,
    createdAt: "2025-04-05",
  },
  {
    id: "b5",
    code: "LOT-2026-05-062",
    productId: "p3",
    productName: products[2].name,
    warehouseId: "wh2",
    location: "Khu A - Kệ 06",
    quantity: 80,
    productionDate: "2026-05-14",
    expiryDate: "2025-05-12",
    costPrice: 12200,
    createdAt: "2026-05-14",
  },
  {
    id: "b6",
    code: "LOT-2026-04-250",
    productId: "p4",
    productName: products[3].name,
    warehouseId: "wh2",
    location: "Khu D - Kệ 02",
    quantity: 60,
    productionDate: "2025-04-08",
    expiryDate: "2026-05-01",
    costPrice: 45000,
    createdAt: "2025-04-08",
  },
  {
    id: "b7",
    code: "LOT-2025-04-411",
    productId: "p5",
    productName: products[4].name,
    warehouseId: "wh1",
    location: "Khu A - Kệ 03",
    quantity: 90,
    productionDate: "2026-05-12",
    expiryDate: "2026-05-04",
    costPrice: 13000,
    createdAt: "2026-05-12",
  },
  {
    id: "b8",
    code: "LOT-2025-04-512",
    productId: "p7",
    productName: products[6].name,
    warehouseId: "wh1",
    location: "Khu C - Kệ 07",
    quantity: 70,
    productionDate: "2025-04-01",
    expiryDate: "2025-05-05",
    costPrice: 85000,
    createdAt: "2025-04-01",
  },
  {
    id: "b9",
    code: "LOT-2025-04-613",
    productId: "p8",
    productName: products[7].name,
    warehouseId: "wh2",
    location: "Khu E - Kệ 01",
    quantity: 40,
    productionDate: "2026-05-08",
    expiryDate: "2026-05-05",
    costPrice: 8000,
    createdAt: "2026-05-08",
  },
];

// ===== Roles & Permissions =====
export const ALL_PERMISSIONS = [
  "dashboard.view",
  "products.view",
  "products.manage",
  "inventory.view",
  "inventory.manage",
  "orders.view",
  "orders.confirm",
  "orders.handover",
  "orders.complete",
  "customers.view",
  "marketing.manage",
  "voucher.manage",
  "banner.manage",
  "post.manage",
  "report.view",
  "user.manage",
  "warehouse.manage",
] as const;

export const roles: Role[] = [
  {
    key: "admin",
    name: "Quản trị viên",
    description: "Toàn quyền hệ thống",
    permissions: [...ALL_PERMISSIONS],
  },
  {
    key: "warehouse_manager",
    name: "Quản lý kho",
    description: "Quản lý kho và đơn hàng",
    permissions: [
      "dashboard.view",
      "products.view",
      "inventory.view",
      "inventory.manage",
      "orders.view",
      "orders.confirm",
      "orders.handover",
      "orders.complete",
      "warehouse.manage",
      "report.view",
    ],
  },
  {
    key: "warehouse_staff",
    name: "Nhân viên kho",
    description: "Soạn và bàn giao đơn",
    permissions: [
      "dashboard.view",
      "inventory.view",
      "orders.view",
      "orders.handover",
      "orders.complete",
    ],
  },
  {
    key: "marketing",
    name: "Marketing",
    description: "Quản lý khuyến mãi, banner, bài viết",
    permissions: [
      "dashboard.view",
      "products.view",
      "marketing.manage",
      "voucher.manage",
      "banner.manage",
      "post.manage",
      "report.view",
    ],
  },
  {
    key: "accountant",
    name: "Kế toán",
    description: "Xem báo cáo doanh thu",
    permissions: ["dashboard.view", "orders.view", "report.view", "customers.view"],
  },
];

export const systemUsers: SystemUser[] = [
  {
    id: "u1",
    name: "Admin Xus",
    email: "admin@xus.vn",
    phone: "0900000001",
    role: "admin",
    active: true,
    createdAt: "2025-01-01",
  },
  {
    id: "u2",
    name: "Trần Văn Kho",
    email: "kho.hcm@xus.vn",
    phone: "0900000002",
    role: "warehouse_manager",
    active: true,
    createdAt: "2025-01-12",
  },
  {
    id: "u3",
    name: "Lê Thị Soạn",
    email: "soan.hcm@xus.vn",
    phone: "0900000003",
    role: "warehouse_staff",
    active: true,
    createdAt: "2025-02-05",
  },
  {
    id: "u4",
    name: "Phạm Marketing",
    email: "mkt@xus.vn",
    phone: "0900000004",
    role: "marketing",
    active: true,
    createdAt: "2025-02-15",
  },
  {
    id: "u5",
    name: "Đỗ Kế Toán",
    email: "ketoan@xus.vn",
    phone: "0900000005",
    role: "accountant",
    active: true,
    createdAt: "2025-03-01",
  },
];

// ===== Posts =====
export const posts: Post[] = [
  {
    id: "po1",
    title: "5 cách bảo quản rau tươi lâu trong tủ lạnh",
    slug: "bao-quan-rau-tuoi",
    category: "Mẹo hay",
    cover: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
    excerpt: "Bí quyết giữ rau tươi đến 2 tuần mà vẫn giòn ngọt.",
    status: "published",
    author: "Admin Xus",
    publishedAt: "2026-05-11",
  },
  {
    id: "po2",
    title: "Top trái cây giàu vitamin C cho mùa hè",
    slug: "trai-cay-vitamin-c",
    category: "Dinh dưỡng",
    cover: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600",
    excerpt: "Bổ sung vitamin C tự nhiên với 7 loại trái cây này.",
    status: "published",
    author: "Phạm Marketing",
    publishedAt: "2026-05-16",
  },
  {
    id: "po3",
    title: "Xus ra mắt combo Salad Healthy mới",
    slug: "combo-salad-healthy",
    category: "Tin tức",
    cover: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    excerpt: "Combo salad giảm 20%, freeship toàn quốc.",
    status: "draft",
    author: "Phạm Marketing",
    publishedAt: "2026-05-04",
  },
];

// ===== Memberships =====
export const memberships: MembershipTier[] = [
  {
    id: "m1",
    name: "Hạt Mầm",
    minSpent: 0,
    discount: 0,
    perks: ["Tích điểm 1%", "Sinh nhật giảm 5%"],
    color: "oklch(0.78 0.10 145)",
  },
  {
    id: "m2",
    name: "Lá Xanh",
    minSpent: 2000000,
    discount: 3,
    perks: ["Tích điểm 2%", "Freeship đơn từ 200K", "Voucher tháng"],
    color: "oklch(0.65 0.15 145)",
  },
  {
    id: "m3",
    name: "Cây Lớn",
    minSpent: 8000000,
    discount: 7,
    perks: ["Tích điểm 3%", "Freeship không giới hạn", "Quà sinh nhật"],
    color: "oklch(0.55 0.17 145)",
  },
  {
    id: "m4",
    name: "Rừng Vàng",
    minSpent: 20000000,
    discount: 12,
    perks: ["Tích điểm 5%", "Hotline VIP", "Quà cao cấp", "Ưu tiên giao 2H"],
    color: "oklch(0.68 0.18 90)",
  },
];

// ===== Banners =====
export const banners: Banner[] = [
  {
    id: "bn1",
    title: "Combo Salad Healthy giảm 20%",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&h=400&fit=crop",
    link: "/promo/salad",
    promotionId: "pr1",
    startDate: "2026-05-11",
    endDate: "2025-05-15",
    position: "home_hero",
  },
  {
    id: "bn2",
    title: "Mua táo tặng nho",
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200&h=400&fit=crop",
    link: "/promo/bogo",
    promotionId: "pr2",
    startDate: "2026-05-06",
    endDate: "2026-04-26",
    position: "home_strip",
  },
  {
    id: "bn3",
    title: "Trái cây nhập khẩu mùa hè",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=400&fit=crop",
    link: "/cat/import",
    startDate: "2025-05-01",
    endDate: "2025-06-30",
    position: "category_top",
  },
  {
    id: "bn4",
    title: "Tết 2025 - đã kết thúc",
    image: "https://images.unsplash.com/photo-1583663848692-c3e2a1eb6c1e?w=1200&h=400&fit=crop",
    link: "/promo/tet",
    startDate: "2025-01-15",
    endDate: "2025-02-15",
    position: "home_hero",
  },
];

// ===== Vouchers =====
export const vouchers: Voucher[] = [
  {
    id: "v1",
    code: "XUS50K",
    name: "Giảm 50K cho đơn từ 300K",
    type: "fixed",
    value: 50000,
    minOrder: 300000,
    quota: 1000,
    used: 234,
    startDate: "2025-04-01",
    endDate: "2025-05-31",
    active: true,
  },
  {
    id: "v2",
    code: "FRESH10",
    name: "Giảm 10% rau củ",
    type: "percent",
    value: 10,
    minOrder: 100000,
    quota: 500,
    used: 123,
    startDate: "2026-05-11",
    endDate: "2026-04-26",
    active: true,
  },
  {
    id: "v3",
    code: "FREESHIP",
    name: "Miễn phí vận chuyển",
    type: "shipping",
    value: 30000,
    minOrder: 150000,
    quota: 2000,
    used: 877,
    startDate: "2025-04-01",
    endDate: "2025-12-31",
    active: true,
  },
  {
    id: "v4",
    code: "MEMBER12",
    name: "Thành viên Rừng Vàng -12%",
    type: "percent",
    value: 12,
    minOrder: 0,
    quota: 200,
    used: 45,
    startDate: "2025-03-01",
    endDate: "2026-05-11",
    active: false,
  },
];

// ===== B2B Customers =====
export const b2bCustomers: B2BCustomer[] = [
  {
    id: "b2b1",
    code: "B2B-0001",
    companyName: "Công ty TNHH Nhà hàng Xanh",
    taxCode: "0312345678",
    contactName: "Nguyễn Văn Toàn",
    phone: "0911111111",
    email: "toan@nhahangxanh.vn",
    address: "12 Nguyễn Huệ, Q1, TP.HCM",
    bankAccount: "1903xxxx9999",
    bankName: "Vietcombank HCM",
    contractNo: "HD-2025-001",
    contractStart: "2025-01-01",
    contractEnd: "2025-12-31",
    creditLimit: 50000000,
    debt: 12500000,
    priceTier: "wholesale_2",
    totalOrders: 24,
    totalSpent: 245000000,
    createdAt: "2025-01-05",
  },
  {
    id: "b2b2",
    code: "B2B-0002",
    companyName: "Cổ phần Siêu thị Mini Fresh",
    taxCode: "0398765432",
    contactName: "Trần Thị Hằng",
    phone: "0922222222",
    email: "hang@minifresh.vn",
    address: "45 Lê Lai, Q1, TP.HCM",
    bankAccount: "1234xxxx5678",
    bankName: "Techcombank",
    contractNo: "HD-2025-002",
    contractStart: "2025-02-01",
    contractEnd: "2026-02-01",
    creditLimit: 100000000,
    debt: 0,
    priceTier: "wholesale_3",
    totalOrders: 56,
    totalSpent: 680000000,
    createdAt: "2025-02-01",
  },
  {
    id: "b2b3",
    code: "B2B-0003",
    companyName: "Khách sạn Sài Gòn Riverside",
    taxCode: "0301122334",
    contactName: "Lê Hoàng Nam",
    phone: "0933333333",
    email: "purchasing@sgriverside.vn",
    address: "98 Tôn Đức Thắng, Q1, TP.HCM",
    creditLimit: 30000000,
    debt: 5800000,
    priceTier: "wholesale_1",
    totalOrders: 8,
    totalSpent: 56000000,
    createdAt: "2025-03-12",
  },
];

export const b2bOrders: B2BOrder[] = [
  {
    id: "bo1",
    code: "B2BDH-0001",
    b2bCustomerId: "b2b1",
    companyName: b2bCustomers[0].companyName,
    items: [
      { productId: "p1", productName: products[0].name, quantity: 50, price: 22000 },
      { productId: "p3", productName: products[2].name, quantity: 80, price: 19000 },
    ],
    subtotal: 2620000,
    vatPercent: 8,
    vatAmount: 209600,
    total: 2829600,
    paymentTerm: "30days",
    paid: 0,
    hasRedInvoice: true,
    redInvoiceNo: "0000001",
    status: "delivered",
    warehouseId: "wh1",
    createdBy: "Admin_Xus",
    note: "Giao theo hợp đồng tháng 4",
    createdAt: "2026-05-08",
  },
  {
    id: "bo2",
    code: "B2BDH-0002",
    b2bCustomerId: "b2b2",
    companyName: b2bCustomers[1].companyName,
    items: [{ productId: "p2", productName: products[1].name, quantity: 30, price: 130000 }],
    subtotal: 3900000,
    vatPercent: 8,
    vatAmount: 312000,
    total: 4212000,
    paymentTerm: "60days",
    paid: 4212000,
    hasRedInvoice: true,
    redInvoiceNo: "0000002",
    status: "paid",
    warehouseId: "wh1",
    createdBy: "Admin_Xus",
    note: "",
    createdAt: "2026-05-11",
  },
  {
    id: "bo3",
    code: "B2BDH-0003",
    b2bCustomerId: "b2b3",
    companyName: b2bCustomers[2].companyName,
    items: [{ productId: "p4", productName: products[3].name, quantity: 20, price: 70000 }],
    subtotal: 1400000,
    vatPercent: 10,
    vatAmount: 140000,
    total: 1540000,
    paymentTerm: "cash",
    paid: 0,
    hasRedInvoice: false,
    status: "confirmed",
    warehouseId: "wh2",
    createdBy: "Admin_Xus",
    note: "Khách yêu cầu giao sáng",
    createdAt: "2026-05-04",
  },
];

export const redInvoices: RedInvoice[] = [
  {
    id: "ri1",
    invoiceNo: "0000001",
    serialNo: "1C25TXX",
    b2bOrderId: "bo1",
    b2bCustomerId: "b2b1",
    companyName: b2bCustomers[0].companyName,
    taxCode: b2bCustomers[0].taxCode,
    subtotal: 2620000,
    vatPercent: 8,
    vatAmount: 209600,
    total: 2829600,
    issuedAt: "2026-05-08",
    status: "issued",
  },
  {
    id: "ri2",
    invoiceNo: "0000002",
    serialNo: "1C25TXX",
    b2bOrderId: "bo2",
    b2bCustomerId: "b2b2",
    companyName: b2bCustomers[1].companyName,
    taxCode: b2bCustomers[1].taxCode,
    subtotal: 3900000,
    vatPercent: 8,
    vatAmount: 312000,
    total: 4212000,
    issuedAt: "2026-05-11",
    status: "issued",
  },
];
