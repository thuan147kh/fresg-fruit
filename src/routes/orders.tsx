import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatVND, formatDateTime } from "@/lib/format";
import { Plus, ArrowRight, CheckCircle2, Warehouse, Trash2 } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/mockData";
import { toast } from "sonner";
import { TestOrderDialog } from "@/components/orders/TestOrderDialog";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Quản lý đơn hàng — Xus Admin" },
      { name: "description", content: "Quản lý và xử lý đơn hàng từ khách hàng." },
    ],
  }),
  component: OrdersPage,
});

const statusConfig: Record<
  OrderStatus,
  { label: string; tone: "warning" | "info" | "success" | "danger" | "muted" }
> = {
  pending: { label: "Chờ xác nhận", tone: "warning" },
  preparing: { label: "Đang soạn hàng", tone: "info" },
  shipping: { label: "Đang giao", tone: "info" },
  completed: { label: "Hoàn thành", tone: "success" },
  cancelled: { label: "Đã hủy", tone: "danger" },
};

const tabs: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "preparing", label: "Đang soạn hàng" },
  { value: "shipping", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

function OrdersPage() {
  const orders = useAppStore((s) => s.orders);
  const warehouses = useAppStore((s) => s.warehouses);
  const setOrderWarehouse = useAppStore((s) => s.setOrderWarehouse);
  const completeOrder = useAppStore((s) => s.completeOrder);
  const confirmOrderFEFO = useAppStore((s) => s.confirmOrder);
  const deleteOrder = useAppStore((s) => s.deleteOrder);
  const [tab, setTab] = useState<OrderStatus | "all">("all");
  const [detail, setDetail] = useState<Order | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [confirmWarehouse, setConfirmWarehouse] = useState("");
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  const filtered = (orders || []).filter((o) => o && (tab === "all" ? true : o.status === tab));

  const warehouseName = (id?: string) => warehouses.find((w) => w && w.id === id)?.name ?? "—";

  const openConfirm = (o: Order) => {
    setConfirmOrder(o);
    setConfirmWarehouse(warehouses.find((w) => w && w.active)?.id || "");
  };

  const handleConfirm = () => {
    if (!confirmOrder || !confirmWarehouse) return;
    setOrderWarehouse(confirmOrder.id, confirmWarehouse);
    confirmOrderFEFO(confirmOrder.id);
    toast.success(`Đã xác nhận đơn ${confirmOrder.code} — Trừ kho FEFO`);
    setConfirmOrder(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đơn hàng"
        description={`${orders.length} đơn hàng trên hệ thống`}
        actions={
          <div className="flex gap-2">
            <Link
              to="/orders/new"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <Plus className="size-4" /> Đơn mới
            </Link>
            <Button
              onClick={() => setTestDialogOpen(true)}
              className="gap-2 btn-glow text-primary-foreground"
            >
              <Plus className="size-4" /> Tạo đơn test
            </Button>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as OrderStatus | "all")}>
        <TabsList className="bg-muted/50 p-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-1.5 opacity-50 text-[10px]">
                ({(orders || []).filter((o) => o && (t.value === "all" ? true : o.status === t.value)).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card className="p-0 overflow-hidden card-3d shadow-elegant">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Mã đơn</th>
                    <th className="px-4 py-3 text-left font-medium">Khách hàng</th>
                    <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 text-right font-medium">Tổng</th>
                    <th className="px-4 py-3 text-left font-medium">Kho xuất</th>
                    <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-medium">Ngày</th>
                    <th className="px-4 py-3 text-right font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {(filtered || []).filter(Boolean).map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => setDetail(o)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{o.code}</td>
                      <td className="px-4 py-3 font-medium">{o.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.items.length} sản phẩm</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {formatVND(o.total)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {warehouseName(o.warehouseId)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={statusConfig[o.status].label}
                          tone={statusConfig[o.status].tone}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(o.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {o.status === "pending" && (
                            <Button
                              size="sm"
                              className="gap-1 btn-glow text-primary-foreground"
                              onClick={() => openConfirm(o)}
                            >
                              Xác nhận <ArrowRight className="size-3.5" />
                            </Button>
                          )}
                          {o.status === "shipping" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              onClick={() => {
                                completeOrder(o.id);
                                toast.success(`Đơn ${o.code} đã hoàn thành`);
                              }}
                            >
                              <CheckCircle2 className="size-3.5 text-success" /> Hoàn thành
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setDetail(o)}>
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                        Không có đơn hàng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>Chi tiết đơn hàng {detail.code}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Khách hàng</div>
                    <div className="font-medium">{detail.customerName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Trạng thái</div>
                    <StatusBadge
                      label={statusConfig[detail.status].label}
                      tone={statusConfig[detail.status].tone}
                    />
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Kho xuất</div>
                    <div className="font-medium">{warehouseName(detail.warehouseId)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Bàn giao</div>
                    <div className="font-medium">
                      {detail.handoverStatus === "picked"
                        ? "Đã lấy hàng"
                        : detail.handoverStatus === "waiting"
                          ? "Chờ lấy hàng"
                          : "—"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground text-xs">Địa chỉ giao</div>
                    <div>{detail.shippingAddress}</div>
                  </div>
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Sản phẩm</th>
                        <th className="px-3 py-2 text-right font-medium">SL</th>
                        <th className="px-3 py-2 text-right font-medium">Giá</th>
                        <th className="px-3 py-2 text-right font-medium">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {detail.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">{it.productName}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{it.quantity}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatVND(it.price)}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-medium">
                            {formatVND(it.price * it.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm text-muted-foreground">Phí vận chuyển: 0đ</div>
                  <div className="text-lg font-bold text-primary">
                    Tổng cộng: {formatVND(detail.total)}
                  </div>
                </div>
                <DialogFooter className="border-t pt-4">
                  <Button variant="outline" onClick={() => setDetail(null)}>Đóng</Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Xóa đơn hàng ${detail.code}?`)) {
                        deleteOrder(detail.id);
                        toast.success("Đã xóa đơn hàng");
                        setDetail(null);
                      }
                    }}
                  >
                    <Trash2 className="size-4 mr-1" /> Xóa đơn
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm with warehouse */}
      <Dialog open={!!confirmOrder} onOpenChange={(o) => !o && setConfirmOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận đơn {confirmOrder?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">Chọn kho để soạn hàng và đóng gói cho đơn này.</p>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Warehouse className="size-3.5" /> Kho xuất hàng
              </Label>
              <Select value={confirmWarehouse} onValueChange={setConfirmWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kho" />
                </SelectTrigger>
                <SelectContent>
                  {(warehouses || [])
                    .filter((w) => w && w.active)
                    .map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{w.name}</span>
                          <span className="text-xs text-muted-foreground">{w.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOrder(null)}>Hủy</Button>
            <Button onClick={handleConfirm} disabled={!confirmWarehouse}>
              Xác nhận soạn hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TestOrderDialog open={testDialogOpen} onOpenChange={setTestDialogOpen} />
    </div>
  );
}
