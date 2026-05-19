import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  UserPlus,
  ShoppingCart,
  Megaphone,
  ChevronDown,
  ChevronLeft,
  Leaf,
  Tag,
  FolderTree,
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
  ClipboardCheck,
  ListOrdered,
  Truck,
  BarChart3,
  Shield,
  FileText,
  Crown,
  Image as ImageIcon,
  Ticket,
  Store,
  Layers,
  Building2,
  Receipt,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/contexts/AuthContext";

interface NavChild {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  perm?: string;
}
interface NavItem {
  to?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
  perm?: string;
}

const navItems: NavItem[] = [
  { to: "/", label: "Tổng quan", icon: LayoutDashboard, perm: "dashboard.view" },
  {
    label: "Quản lý sản phẩm",
    icon: Package,
    perm: "products.view",
    children: [
      { to: "/products", label: "Sản phẩm", icon: Tag },
      { to: "/categories", label: "Danh mục", icon: FolderTree },
    ],
  },
  {
    label: "Quản lý kho",
    icon: Boxes,
    perm: "inventory.view",
    children: [
      { to: "/inventory/import", label: "Nhập kho", icon: ArrowDownToLine },
      { to: "/inventory/destroy", label: "Xuất hủy", icon: Trash2 },
      { to: "/inventory/export", label: "Xuất kho", icon: ArrowUpFromLine },
      { to: "/inventory/audit", label: "Kiểm kho", icon: ClipboardCheck },
      { to: "/inventory/stock", label: "Tồn kho (theo lô)", icon: Layers },
    ],
  },
  { to: "/customers", label: "Khách hàng", icon: Users, perm: "customers.view" },
  { to: "/affiliates", label: "Cộng tác viên", icon: UserPlus, perm: "customers.view" },
  {
    label: "Xử lý đơn hàng",
    icon: ShoppingCart,
    perm: "orders.view",
    children: [
      { to: "/orders", label: "Quản lý đơn hàng", icon: ListOrdered },
      { to: "/orders/handover", label: "Bàn giao đơn hàng", icon: Truck },
    ],
  },
  {
    label: "Bán hàng B2B",
    icon: Briefcase,
    perm: "orders.view",
    children: [
      { to: "/b2b/customers", label: "Khách B2B", icon: Building2 },
      { to: "/b2b/orders", label: "Đơn B2B", icon: ListOrdered },
      { to: "/b2b/invoices", label: "Hóa đơn đỏ", icon: Receipt },
    ],
  },
  { to: "/marketing", label: "Khuyến mãi", icon: Megaphone, perm: "marketing.manage" },
  { to: "/banners", label: "Banner", icon: ImageIcon, perm: "banner.manage" },
  { to: "/vouchers", label: "Voucher", icon: Ticket, perm: "voucher.manage" },
  { to: "/posts", label: "Bài viết", icon: FileText, perm: "post.manage" },
  { to: "/membership", label: "Membership", icon: Crown, perm: "marketing.manage" },
  { to: "/stores", label: "Quản lý cửa hàng", icon: Store, perm: "warehouse.manage" },
  { to: "/reports", label: "Báo cáo", icon: BarChart3, perm: "report.view" },
  // { to: "/permissions", label: "Phân quyền", icon: Shield, perm: "user.manage" }, // Hidden
  // { to: "/settings", label: "Cài đặt", icon: SettingsIcon, perm: "user.manage" }, // Hidden
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const currentRole = useAppStore((s) => s.currentRole);
  const roles = useAppStore((s) => s.roles);
  const role = roles.find((r) => r.key === currentRole);
  const { isAdmin } = useAuth();
  const can = (perm?: string) => isAdmin || !perm || (role?.permissions.includes(perm) ?? false);

  const initialOpen: Record<string, boolean> = {};
  navItems.forEach((item) => {
    if (item.children?.some((c) => pathname.startsWith(c.to))) {
      initialOpen[item.label] = true;
    }
  });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpen);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  const visibleItems = navItems.filter((item) => {
    if (item.children) return can(item.perm) && item.children.length > 0;
    return can(item.perm);
  });

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-[width] duration-300 z-30 relative overflow-hidden",
        collapsed ? "w-16" : "w-64",
      )}
      style={{ backgroundImage: "var(--gradient-sidebar)" }}
    >
      {/* glow blob */}
      <div
        className="pointer-events-none absolute -top-20 -left-10 size-56 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-primary-vivid)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 -right-10 size-48 rounded-full opacity-20 blur-3xl"
        style={{ background: "oklch(0.7 0.18 100)" }}
      />

      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border relative z-10">
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
          <div
            className="size-9 rounded-xl flex items-center justify-center shrink-0 shadow-glow"
            style={{ background: "var(--gradient-primary-vivid)" }}
          >
            <Leaf className="size-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg tracking-tight">Xus</span>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition shrink-0"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("size-5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 relative z-10 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-sidebar-border">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const open = openGroups[item.label] ?? false;
            const childActive = item.children.some((c) => isActive(c.to));
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpenGroups((g) => ({ ...g, [item.label]: !open }))}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    childActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner-soft"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:translate-x-0.5",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn("size-4 transition-transform", open && "rotate-180")}
                      />
                    </>
                  )}
                </button>
                {!collapsed && open && (
                  <div className="ml-4 mt-0.5 pl-3 border-l border-sidebar-border space-y-0.5 py-1 animate-fade-in-up">
                    {item.children.map((child) => {
                      const CIcon = child.icon;
                      const active = isActive(child.to);
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all",
                            active
                              ? "text-sidebar-primary-foreground font-medium shadow-glow"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground hover:translate-x-0.5",
                          )}
                          style={
                            active
                              ? { backgroundImage: "var(--gradient-primary-vivid)" }
                              : undefined
                          }
                        >
                          <CIcon className="size-3.5" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          const active = isActive(item.to!);
          return (
            <Link
              key={item.to}
              to={item.to!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:translate-x-0.5",
              )}
              style={active ? { backgroundImage: "var(--gradient-primary-vivid)" } : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/50 relative z-10">
          © 2025 Xus · Eco-friendly 🌱
        </div>
      )}
    </aside>
  );
}
