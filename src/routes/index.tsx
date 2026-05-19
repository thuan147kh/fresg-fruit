import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@/store/useAppStore";
import { formatVND, formatNumber, daysUntil } from "@/lib/format";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, ShoppingBag, Users, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tổng quan — Xus Admin" },
      {
        name: "description",
        content: "Dashboard tổng quan doanh thu, đơn hàng và khách hàng của sàn Xus.",
      },
    ],
  }),
  component: DashboardPage,
});

const PIE_COLORS = [
  "oklch(0.58 0.16 145)",
  "oklch(0.7 0.15 95)",
  "oklch(0.65 0.18 50)",
  "oklch(0.6 0.14 200)",
  "oklch(0.55 0.2 25)",
];

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  delta,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  delta?: string;
}) {
  return (
    <Card className="p-5 card-3d relative overflow-hidden">
      <div className="absolute -top-8 -right-8 size-24 rounded-full opacity-15 blur-2xl bg-primary" />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </div>
          <div className="text-2xl lg:text-3xl font-bold mt-2 tabular-nums">{value}</div>
          {delta && <div className="text-xs text-success mt-1.5 font-medium">{delta}</div>}
        </div>
        <div
          className={`size-11 rounded-xl flex items-center justify-center ${accent} shadow-glow`}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}

function DashboardPage() {
  const orders = useAppStore((s) => s.orders) || [];
  const customers = useAppStore((s) => s.customers) || [];
  const products = useAppStore((s) => s.products) || [];

  // Calculate dynamic weekly revenue (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const computedWeeklyRevenue = last7Days.map((d) => {
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => o && o.status !== "cancelled" && o.createdAt && o.createdAt.includes(dateStr));
    const revenue = dayOrders.reduce((sum, o) => sum + ((o && o.total) || 0), 0);
    const dayLabel = d.toLocaleDateString("vi-VN", { weekday: "short" });
    return { day: dayLabel, revenue: revenue || 0 };
  });

  // Calculate dynamic category share based on completed orders
  const categorySales: Record<string, number> = {};
  orders.filter((o) => o && o.status !== "cancelled").forEach((o) => {
    ((o && o.items) || []).forEach((item) => {
      const product = products.find((p) => p && p.id === item.productId);
      const cat = product?.category || "Khác";
      categorySales[cat] = (categorySales[cat] || 0) + ((item.quantity || 0) * (item.price || 0));
    });
  });

  const totalCatSales = Object.values(categorySales).reduce((a, b) => a + b, 0);
  let computedCategoryShare = Object.entries(categorySales)
    .filter(([_, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value: totalCatSales > 0 ? Number(((value / totalCatSales) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (computedCategoryShare.length === 0) {
    computedCategoryShare = [{ name: "Chưa có dữ liệu", value: 100 }];
  }

  const totalRevenue = orders.filter((o) => o && o.status !== "cancelled").reduce((s, o) => s + (o ? o.total : 0), 0);
  const newOrders = orders.filter((o) => o && o.status === "pending").length;
  const expiringSoon = products.filter((p) => p && p.expiryDate && daysUntil(p.expiryDate) <= 30).length;

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        description="Theo dõi hiệu suất kinh doanh của sàn Xus theo thời gian thực."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Tổng doanh thu"
          value={formatVND(totalRevenue)}
          icon={TrendingUp}
          accent="bg-primary/10 text-primary"
          delta="↑ 12.5% so với tuần trước"
        />
        <KpiCard
          label="Đơn hàng mới"
          value={formatNumber(newOrders)}
          icon={ShoppingBag}
          accent="bg-info/15 text-info"
          delta="Cần xác nhận"
        />
        <KpiCard
          label="Khách hàng"
          value={formatNumber(customers.length)}
          icon={Users}
          accent="bg-accent text-accent-foreground"
          delta={`+${customers.length} active`}
        />
        <KpiCard
          label="SP sắp hết hạn"
          value={formatNumber(expiringSoon)}
          icon={AlertTriangle}
          accent="bg-warning/15 text-warning-foreground"
          delta="Trong 30 ngày tới"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Doanh thu theo tuần</h3>
              <p className="text-xs text-muted-foreground">7 ngày gần nhất</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computedWeeklyRevenue}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 145)"
                  vertical={false}
                />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 145)" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="oklch(0.5 0.02 145)"
                  tickFormatter={(v) => `${v / 1000000}M`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 145)" }}
                  formatter={(v: number) => [formatVND(v), "Doanh thu"]}
                />
                <Bar dataKey="revenue" fill="oklch(0.58 0.16 145)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-1">Tỷ lệ danh mục bán chạy</h3>
          <p className="text-xs text-muted-foreground mb-4">Theo doanh số tháng</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={computedCategoryShare}
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  innerRadius={45}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {computedCategoryShare.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 mt-4">
        <h3 className="font-semibold mb-4">Đơn hàng gần đây</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider">
              <tr className="border-b border-border">
                <th className="py-2.5 font-medium">Mã đơn</th>
                <th className="py-2.5 font-medium">Khách hàng</th>
                <th className="py-2.5 font-medium text-right">Tổng</th>
                <th className="py-2.5 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter(Boolean).slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 font-medium">{o.code}</td>
                  <td className="py-3">{o.customerName}</td>
                  <td className="py-3 text-right tabular-nums">{formatVND(o.total)}</td>
                  <td className="py-3 text-muted-foreground">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
