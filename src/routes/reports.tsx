import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { formatVND, formatNumber } from "@/lib/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, ShoppingBag, DollarSign, Users } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Báo cáo — Xus Admin" },
      { name: "description", content: "Báo cáo doanh thu, đơn hàng, khách hàng và tồn kho." },
    ],
  }),
  component: ReportsPage,
});

const PIE_COLORS = [
  "oklch(0.58 0.16 145)",
  "oklch(0.7 0.15 95)",
  "oklch(0.65 0.18 50)",
  "oklch(0.6 0.14 200)",
  "oklch(0.55 0.2 25)",
];



function Stat({
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
  delta: string;
}) {
  return (
    <Card className="p-5 card-3d">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </div>
          <div className="text-2xl font-bold mt-2 tabular-nums">{value}</div>
          <div className="text-xs text-success mt-1.5 font-medium">{delta}</div>
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

function ReportsPage() {
  const orders = useAppStore((s) => s.orders) || [];
  const customers = useAppStore((s) => s.customers) || [];
  const products = useAppStore((s) => s.products) || [];

  // 1. Calculate Monthly (Last 6 months)
  const monthlyData: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mStr = `T${d.getMonth() + 1}`;
    monthlyData[mStr] = { revenue: 0, orders: 0 };
  }
  
  orders.forEach(o => {
    if (!o || o.status === "cancelled") return;
    const mStr = `T${new Date(o.createdAt).getMonth() + 1}`;
    if (monthlyData[mStr]) {
      monthlyData[mStr].revenue += o.total;
      monthlyData[mStr].orders += 1;
    }
  });

  const computedMonthly = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
  }));

  // 2. Calculate Top Products
  const productSales: Record<string, number> = {};
  orders.forEach(o => {
    if (!o || o.status === "cancelled") return;
    (o.items || []).forEach(item => {
      productSales[item.productId] = (productSales[item.productId] || 0) + (item.quantity || 0);
    });
  });

  let computedTopProducts = Object.entries(productSales)
    .filter(([_, sold]) => sold > 0)
    .map(([id, sold]) => {
      const p = products.find(x => x && x.id === id);
      return { name: p?.name || "Sản phẩm ẩn", sold };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  if (computedTopProducts.length === 0) {
    computedTopProducts = [{ name: "Chưa có dữ liệu", sold: 0 }];
  }

  // 3. Category Share
  const categorySales: Record<string, number> = {};
  orders.forEach(o => {
    if (!o || o.status === "cancelled") return;
    (o.items || []).forEach(item => {
      const p = products.find(x => x && x.id === item.productId);
      const cat = p?.category || "Khác";
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

  // 4. Weekly Revenue
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

  const totalRev = computedMonthly.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = computedMonthly.reduce((s, m) => s + m.orders, 0);
  const completed = orders.filter((o) => o && o.status !== "cancelled").length;

  return (
    <div>
      <PageHeader
        title="Báo cáo & thống kê"
        description="Xem doanh thu, đơn hàng và sản phẩm bán chạy theo thời gian."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat
          label="Doanh thu 6 tháng"
          value={formatVND(totalRev)}
          icon={DollarSign}
          accent="bg-primary text-primary-foreground"
          delta="↑ 18.5% YoY"
        />
        <Stat
          label="Đơn hàng"
          value={formatNumber(totalOrders)}
          icon={ShoppingBag}
          accent="bg-info text-info-foreground"
          delta={`+${completed} hoàn thành`}
        />
        <Stat
          label="Khách hàng"
          value={formatNumber(customers.length)}
          icon={Users}
          accent="bg-accent text-accent-foreground"
          delta="+12 tuần này"
        />
        <Stat
          label="Tăng trưởng"
          value="+24.3%"
          icon={TrendingUp}
          accent="bg-warning text-warning-foreground"
          delta="So với quý trước"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2 card-3d">
          <h3 className="font-semibold mb-1">Doanh thu 6 tháng gần nhất</h3>
          <p className="text-xs text-muted-foreground mb-4">Đơn vị: triệu VND</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={computedMonthly}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.58 0.16 145)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.58 0.16 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 145)"
                  vertical={false}
                />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 145)" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="oklch(0.5 0.02 145)"
                  tickFormatter={(v) => `${v / 1_000_000}M`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 145)" }}
                  formatter={(v: number) => formatVND(v)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.58 0.16 145)"
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 card-3d">
          <h3 className="font-semibold mb-1">Tỷ lệ danh mục</h3>
          <p className="text-xs text-muted-foreground mb-4">Theo doanh số</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 card-3d">
          <h3 className="font-semibold mb-1">Doanh thu tuần</h3>
          <p className="text-xs text-muted-foreground mb-4">7 ngày gần nhất</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computedWeeklyRevenue}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 145)"
                  vertical={false}
                />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1_000_000}M`} />
                <Tooltip formatter={(v: number) => formatVND(v)} />
                <Bar dataKey="revenue" fill="oklch(0.58 0.16 145)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 card-3d">
          <h3 className="font-semibold mb-1">Top sản phẩm bán chạy</h3>
          <p className="text-xs text-muted-foreground mb-4">Theo số lượng đã bán</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computedTopProducts} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 145)"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip />
                <Bar dataKey="sold" fill="oklch(0.65 0.18 145)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 mt-4 card-3d">
        <h3 className="font-semibold mb-1">Đơn hàng theo tháng</h3>
        <p className="text-xs text-muted-foreground mb-4">Số lượng đơn 6 tháng</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={computedMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 145)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="oklch(0.65 0.18 50)"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
