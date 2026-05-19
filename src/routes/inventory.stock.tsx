import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Layers, MapPin, Calendar, Package2, AlertTriangle, Search } from "lucide-react";
import { formatDate, formatNumber, daysUntil } from "@/lib/format";
import type { Batch } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory/stock")({
  head: () => ({
    meta: [
      { title: "Tồn kho theo lô — Xus Admin" },
      { name: "description", content: "Quản lý tồn kho theo lô và vị trí ở cả 2 kho." },
    ],
  }),
  component: StockPage,
});

function StockPage() {
  const batches = useAppStore((s) => s.batches);
  const products = useAppStore((s) => s.products);
  const warehouses = useAppStore((s) => s.warehouses);
  const addBatch = useAppStore((s) => s.addBatch);

  const [tab, setTab] = useState<"by-batch" | "by-product">("by-batch");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    code: `LOT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    productId: "",
    warehouseId: warehouses[0]?.id ?? "",
    location: "Khu A - Kệ 01",
    quantity: 0,
    productionDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
    costPrice: 0,
  });

  const filtered = useMemo(() => {
    return (batches || [])
      .filter((b) => b && (warehouseFilter === "all" || b.warehouseId === warehouseFilter))
      .filter(
        (b) =>
          b &&
          (!search ||
            b.code.toLowerCase().includes(search.toLowerCase()) ||
            b.productName.toLowerCase().includes(search.toLowerCase())),
      )
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()); // FEFO
  }, [batches, warehouseFilter, search]);

  // Aggregate by product
  const byProduct = useMemo(() => {
    const map = new Map<
      string,
      {
        productId: string;
        productName: string;
        total: number;
        perWh: Record<string, number>;
        soonest: string;
      }
    >();
    for (const b of batches) {
      if (warehouseFilter !== "all" && b.warehouseId !== warehouseFilter) continue;
      const cur = map.get(b.productId) ?? {
        productId: b.productId,
        productName: b.productName,
        total: 0,
        perWh: {},
        soonest: b.expiryDate,
      };
      cur.total += b.quantity;
      cur.perWh[b.warehouseId] = (cur.perWh[b.warehouseId] ?? 0) + b.quantity;
      if (new Date(b.expiryDate) < new Date(cur.soonest)) cur.soonest = b.expiryDate;
      map.set(b.productId, cur);
    }
    return Array.from(map.values())
      .filter((r) => !search || r.productName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(a.soonest).getTime() - new Date(b.soonest).getTime());
  }, [batches, warehouseFilter, search]);

  const stats = {
    totalBatches: filtered.length,
    totalQty: filtered.reduce((s, b) => s + (b ? b.quantity : 0), 0),
    expiringSoon: filtered.filter((b) => b && daysUntil(b.expiryDate) <= 10 && daysUntil(b.expiryDate) >= 0).length,
    expired: filtered.filter((b) => b && daysUntil(b.expiryDate) < 0).length,
  };

  const submitBatch = () => {
    if (!form.productId || !form.warehouseId || !form.expiryDate || form.quantity <= 0) {
      toast.error("Vui lòng nhập đầy đủ thông tin lô");
      return;
    }
    const product = products.find((p) => p && p.id === form.productId);
    if (!product) return;
    const batch: Batch = {
      id: `b-${Date.now()}`,
      code: form.code,
      productId: form.productId,
      productName: product.name,
      warehouseId: form.warehouseId,
      location: form.location,
      quantity: form.quantity,
      productionDate: form.productionDate,
      expiryDate: form.expiryDate,
      costPrice: form.costPrice || product.costPrice,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addBatch(batch);
    toast.success(`Đã tạo lô ${batch.code}`);
    setOpenCreate(false);
    setForm({
      ...form,
      code: `LOT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      quantity: 0,
      expiryDate: "",
    });
  };

  const expiryBadge = (date: string) => {
    const d = daysUntil(date);
    if (d < 0) return <StatusBadge label="Hết hạn (Cảnh báo)" tone="danger" />;
    if (d <= 10) return <StatusBadge label={`Còn ${d}d - Xuất hủy`} tone="danger" />;
    if (d <= 30) return <StatusBadge label={`Còn ${d}d`} tone="warning" />;
    return <StatusBadge label={`Còn ${d}d`} tone="success" />;
  };

  const warehouseName = (id: string) => warehouses.find((w) => w && w.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader
        title="Tồn kho theo lô"
        description="Theo dõi tồn kho theo từng lô, hạn sử dụng và vị trí trong 2 kho."
        actions={
          <Button
            onClick={() => setOpenCreate(true)}
            className="gap-2 btn-glow text-primary-foreground"
          >
            <Plus className="size-4" /> Tạo lô mới
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card className="p-4 card-3d">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tổng số lô</div>
              <div className="text-xl font-bold tabular-nums">{stats.totalBatches}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 card-3d">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-info/15 text-info flex items-center justify-center">
              <Package2 className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tổng tồn (đơn vị)</div>
              <div className="text-xl font-bold tabular-nums">{formatNumber(stats.totalQty)}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 card-3d">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-warning/20 text-warning-foreground flex items-center justify-center">
              <Calendar className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Sắp hết hạn (≤10d)</div>
              <div className="text-xl font-bold tabular-nums">{stats.expiringSoon}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 card-3d">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Đã hết hạn</div>
              <div className="text-xl font-bold tabular-nums">{stats.expired}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã lô, tên sản phẩm..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Chọn kho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả kho</SelectItem>
            {(warehouses || []).filter(Boolean).map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="mb-3">
          <TabsTrigger value="by-batch">Theo lô (FEFO)</TabsTrigger>
          <TabsTrigger value="by-product">Theo sản phẩm (tồn 2 kho)</TabsTrigger>
        </TabsList>

        <TabsContent value="by-batch">
          <Card className="p-0 overflow-hidden card-3d">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Mã lô</th>
                    <th className="px-4 py-3 font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 font-medium">Kho</th>
                    <th className="px-4 py-3 font-medium">Vị trí</th>
                    <th className="px-4 py-3 font-medium text-right">Số lượng</th>
                    <th className="px-4 py-3 font-medium">NSX</th>
                    <th className="px-4 py-3 font-medium">HSD</th>
                    <th className="px-4 py-3 font-medium">Tình trạng</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtered || []).filter(Boolean).map((b) => (
                    <tr
                      key={b.id}
                      className="border-t border-border/60 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{b.code}</td>
                      <td className="px-4 py-3">{b.productName}</td>
                      <td className="px-4 py-3 text-xs">{warehouseName(b.warehouseId)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="size-3" /> {b.location}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {formatNumber(b.quantity)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(b.productionDate)}
                      </td>
                      <td className="px-4 py-3 text-xs">{formatDate(b.expiryDate)}</td>
                      <td className="px-4 py-3">{expiryBadge(b.expiryDate)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                        Không có lô nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="by-product">
          <Card className="p-0 overflow-hidden card-3d">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Sản phẩm</th>
                    {(warehouses || []).filter(Boolean).map((w) => (
                      <th key={w.id} className="px-4 py-3 font-medium text-right">
                        {w.name}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium text-right">Tổng</th>
                    <th className="px-4 py-3 font-medium">HSD gần nhất</th>
                  </tr>
                </thead>
                <tbody>
                  {(byProduct || []).filter(Boolean).map((r) => (
                    <tr
                      key={r.productId}
                      className="border-t border-border/60 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{r.productName}</td>
                      {(warehouses || []).filter(Boolean).map((w) => (
                        <td key={w.id} className="px-4 py-3 text-right tabular-nums">
                          {r.perWh[w.id] ? (
                            formatNumber(r.perWh[w.id])
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-primary">
                        {formatNumber(r.total)}
                      </td>
                      <td className="px-4 py-3 inline-flex items-center gap-2">
                        <span className="text-xs">{formatDate(r.soonest)}</span>
                        {expiryBadge(r.soonest)}
                      </td>
                    </tr>
                  ))}
                  {byProduct.length === 0 && (
                    <tr>
                      <td
                        colSpan={warehouses.length + 3}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create batch dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo lô mới</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Mã lô</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Sản phẩm</Label>
              <Select
                value={form.productId}
                onValueChange={(v) => setForm({ ...form, productId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {(products || []).filter(Boolean).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kho</Label>
              <Select
                value={form.warehouseId}
                onValueChange={(v) => setForm({ ...form, warehouseId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(warehouses || []).filter(Boolean).map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vị trí</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Khu A - Kệ 01"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Số lượng</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Giá nhập</Label>
              <Input
                type="number"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: +e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ngày sản xuất</Label>
              <Input
                type="date"
                value={form.productionDate}
                onChange={(e) => setForm({ ...form, productionDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hạn sử dụng</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Hủy
            </Button>
            <Button onClick={submitBatch} className="btn-glow text-primary-foreground">
              Tạo lô
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
