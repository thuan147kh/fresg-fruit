import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, AlertTriangle, Check, ArrowLeft } from "lucide-react";
import { formatVND, formatDate, daysUntil } from "@/lib/format";
import type { StockSlip, WarehouseType } from "@/lib/mockData";
import { toast } from "sonner";

interface Props {
  type: "import" | "export" | "destroy" | "audit";
  title: string;
  description: string;
}

const typePrefix = { import: "PN", export: "PX", destroy: "PH", audit: "PK" };

export function InventoryPage({ type, title, description }: Props) {
  const slips = useAppStore((s) => s.stockSlips);
  const products = useAppStore((s) => s.products);
  const adminUser = useAppStore((s) => s.adminUser);
  const addSlip = useAppStore((s) => s.addStockSlip);
  const approve = useAppStore((s) => s.approveStockSlip);

  const [view, setView] = useState<"list" | "create">("list");
  const [items, setItems] = useState<
    { productId: string; productName: string; quantity: number; price: number }[]
  >([]);
  const [picker, setPicker] = useState(false);
  const [form, setForm] = useState({
    code: `${typePrefix[type]}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    supplier: "",
    note: "",
    warehouseType: "normal" as WarehouseType,
  });

  const filtered = slips.filter((s) => s.type === type);
  const expiring = products.filter((p) => daysUntil(p.expiryDate) <= 30);

  const addItem = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    if (items.some((it) => it.productId === id)) return;
    setItems((cur) => [
      ...cur,
      { productId: id, productName: p.name, quantity: 1, price: p.costPrice },
    ]);
  };

  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  const submit = () => {
    if (items.length === 0) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }
    const slip: StockSlip = {
      id: `s-${Date.now()}`,
      type,
      ...form,
      items,
      total,
      createdBy: adminUser,
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addSlip(slip);
    toast.success(`Tạo phiếu ${title.toLowerCase()} thành công`);
    setView("list");
    setItems([]);
    setForm({ ...form, supplier: "", note: "" });
  };

  if (view === "create") {
    return (
      <div>
        <PageHeader
          title={`Tạo phiếu ${title.toLowerCase()}`}
          actions={
            <Button variant="outline" onClick={() => setView("list")} className="gap-2">
              <ArrowLeft className="size-4" /> Quay lại
            </Button>
          }
        />

        {type === "audit" && expiring.length > 0 && (
          <Card className="p-4 mb-4 bg-destructive/5 border-destructive/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-destructive">
                  Cảnh báo: {expiring.length} sản phẩm sắp hết hạn cần xuất hủy
                </div>
                <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                  {expiring.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex justify-between">
                      <span>• {p.name}</span>
                      <span className="text-destructive font-medium">
                        HSD: {formatDate(p.expiryDate)} ({daysUntil(p.expiryDate)} ngày)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Sản phẩm trong phiếu ({items.length})</h3>
              <Button size="sm" onClick={() => setPicker(true)} className="gap-2">
                <Plus className="size-4" />
                Chọn sản phẩm
              </Button>
            </div>
            {items.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Chưa có sản phẩm. Nhấn "Chọn sản phẩm" để bắt đầu.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground uppercase tracking-wider">
                    <tr className="border-b border-border">
                      <th className="py-2 text-left font-medium">Sản phẩm</th>
                      <th className="py-2 text-right font-medium w-24">SL</th>
                      <th className="py-2 text-right font-medium w-32">Đơn giá</th>
                      <th className="py-2 text-right font-medium w-32">Thành tiền</th>
                      <th className="py-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={it.productId} className="border-b border-border/50">
                        <td className="py-2.5">{it.productName}</td>
                        <td className="py-2.5 text-right">
                          <Input
                            type="number"
                            className="h-8 text-right"
                            value={it.quantity}
                            onChange={(e) =>
                              setItems((cur) =>
                                cur.map((x, j) =>
                                  j === i ? { ...x, quantity: +e.target.value } : x,
                                ),
                              )
                            }
                          />
                        </td>
                        <td className="py-2.5 text-right">
                          <Input
                            type="number"
                            className="h-8 text-right"
                            value={it.price}
                            onChange={(e) =>
                              setItems((cur) =>
                                cur.map((x, j) => (j === i ? { ...x, price: +e.target.value } : x)),
                              )
                            }
                          />
                        </td>
                        <td className="py-2.5 text-right tabular-nums font-medium">
                          {formatVND(it.quantity * it.price)}
                        </td>
                        <td className="py-2.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setItems((cur) => cur.filter((_, j) => j !== i))}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-semibold">Thông tin phiếu</h3>
            <div className="space-y-2">
              <Label>Mã phiếu</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Người tạo</Label>
              <Input value={adminUser} disabled />
            </div>
            <div className="space-y-2">
              <Label>Loại kho</Label>
              <Select
                value={form.warehouseType}
                onValueChange={(v) => setForm({ ...form, warehouseType: v as WarehouseType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Kho thông thường</SelectItem>
                  <SelectItem value="cold">Kho mát</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === "import" && (
              <div className="space-y-2">
                <Label>Nhà cung cấp</Label>
                <Input
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng tiền</span>
                <span className="text-lg font-bold text-primary">{formatVND(total)}</span>
              </div>
              <Button onClick={submit} className="w-full mt-3">
                Tạo phiếu
              </Button>
            </div>
          </Card>
        </div>

        <Dialog open={picker} onOpenChange={setPicker}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chọn sản phẩm</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {products.map((p) => {
                const checked = items.some((it) => it.productId === p.id);
                return (
                  <Label
                    key={p.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        if (v) addItem(p.id);
                        else setItems((cur) => cur.filter((it) => it.productId !== p.id));
                      }}
                    />
                    <img src={p.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"} className="size-9 rounded object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{formatVND(p.costPrice)}</div>
                    </div>
                  </Label>
                );
              })}
            </div>
            <DialogFooter>
              <Button onClick={() => setPicker(false)}>Xong</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => setView("create")} className="gap-2">
            <Plus className="size-4" />
            Tạo phiếu
          </Button>
        }
      />

      {type === "audit" && expiring.length > 0 && (
        <Card className="p-4 mb-4 bg-destructive/5 border-destructive/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-destructive">
                ⚠️ Sản phẩm sắp hết hạn sử dụng cần xuất hủy ({expiring.length})
              </div>
              <div className="text-sm text-muted-foreground mt-2 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {expiring.map((p) => (
                  <div key={p.id} className="flex justify-between gap-2 px-2 py-1 rounded bg-card">
                    <span className="truncate">{p.name}</span>
                    <span className="text-destructive font-medium whitespace-nowrap">
                      {daysUntil(p.expiryDate)} ngày
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Mã phiếu</th>
                <th className="px-4 py-3 font-medium">Loại kho</th>
                <th className="px-4 py-3 font-medium">Người tạo</th>
                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                <th className="px-4 py-3 font-medium text-right">Tổng tiền</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border/60 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{s.code}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={s.warehouseType === "cold" ? "Kho mát" : "Kho thường"}
                      tone={s.warehouseType === "cold" ? "info" : "muted"}
                    />
                  </td>
                  <td className="px-4 py-3">{s.createdBy}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatVND(s.total)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={s.status === "approved" ? "Đã duyệt" : "Nháp"}
                      tone={s.status === "approved" ? "success" : "warning"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.status === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => {
                          approve(s.id);
                          toast.success("Đã duyệt phiếu");
                        }}
                      >
                        <Check className="size-3.5" /> Duyệt
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Chưa có phiếu nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
