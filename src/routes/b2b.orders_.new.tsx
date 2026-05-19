import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { formatVND } from "@/lib/format";
import { toast } from "sonner";
import { Search } from "lucide-react";
import type { B2BOrder, OrderItem } from "@/lib/mockData";
import { createB2BOrder } from "@/lib/supabaseApi";

export const Route = createFileRoute("/b2b/orders_/new")({
  head: () => ({ meta: [{ title: "Tạo đơn B2B — Xus Admin" }] }),
  component: B2BOrderNew,
});

const tierDiscount = { wholesale_1: 0.05, wholesale_2: 0.1, wholesale_3: 0.15 };

function B2BOrderNew() {
  const nav = useNavigate();
  const customers = useAppStore((s) => s.b2bCustomers);
  const products = useAppStore((s) => s.products);
  const warehouses = useAppStore((s) => s.warehouses);
  const orders = useAppStore((s) => s.b2bOrders);
  const addB2BOrder = useAppStore((s) => s.addB2BOrder);
  const adminUser = useAppStore((s) => s.adminUser);

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [vatPercent, setVatPercent] = useState(8);
  const [paymentTerm, setPaymentTerm] = useState<B2BOrder["paymentTerm"]>("30days");
  const [hasRedInvoice, setHasRedInvoice] = useState(true);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [note, setNote] = useState("");
  
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const customer = customers.find((c) => c && c.id === customerId);
  const discount = customer ? tierDiscount[customer.priceTier] : 0;

  const addItem = () => {
    const p = products[0];
    if (!p) return;
    const wholesalePrice = Math.round(p.salePrice * (1 - discount));
    setItems((it) => [
      ...it,
      { productId: p.id, productName: p.name, quantity: 10, price: wholesalePrice },
    ]);
  };
  const updateItem = (i: number, patch: Partial<OrderItem>) =>
    setItems((it) => it.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const subtotal = items.reduce((s, i) => s + (i ? i.price * i.quantity : 0), 0);
  const vatAmount = Math.round((subtotal * vatPercent) / 100);
  const total = subtotal + vatAmount;

  const submit = async () => {
    if (!customer || items.length === 0) {
      toast.error("Chọn KH & ít nhất 1 sản phẩm");
      return;
    }
    const code = `B2BDH-${String(orders.length + 1).padStart(4, "0")}`;
    const payload = {
      id: `bo-${Date.now()}`,
      code,
      b2bCustomerId: customerId,
      companyName: customer.companyName,
      items,
      subtotal,
      vatPercent,
      vatAmount,
      total,
      paymentTerm,
      paid: 0,
      hasRedInvoice,
      status: "draft" as const,
      warehouseId,
      createdBy: adminUser,
      note,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addB2BOrder(payload);
    // Sync to backend
    void createB2BOrder({
      code: payload.code,
      b2b_customer_id: payload.b2bCustomerId,
      company_name: payload.companyName,
      items: JSON.stringify(payload.items),
      subtotal: payload.subtotal,
      vat_percent: payload.vatPercent,
      vat_amount: payload.vatAmount,
      total: payload.total,
      payment_term: payload.paymentTerm,
      paid: payload.paid,
      has_red_invoice: payload.hasRedInvoice,
      status: payload.status,
      warehouse_id: payload.warehouseId,
      created_by: payload.createdBy,
      note: payload.note,
    }).catch(() => {/* silently fail */});
    toast.success("Đã tạo đơn B2B " + code + " 🎉");
    nav({ to: "/b2b/orders" });
  };

  return (
    <div>
      <PageHeader
        title="Tạo đơn hàng B2B"
        description="Đơn sỉ với VAT & xuất hóa đơn đỏ"
        actions={
          <>
            <Link to="/b2b/orders" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
            <Button onClick={submit}>
              <Save className="size-4 mr-1" />
              Lưu đơn
            </Button>
          </>
        }
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Mặt hàng</h3>
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label className="text-xs">Sản phẩm</Label>
                  <Button
                    variant="outline"
                    className="w-full text-left justify-start font-normal h-10 truncate"
                    onClick={() => setActiveRowIndex(i)}
                  >
                    {it.productId ? products.find(p => p.id === it.productId)?.name : "Chọn sản phẩm..."}
                  </Button>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">SL</Label>
                  <Input
                    type="number"
                    value={it.quantity}
                    onChange={(e) => updateItem(i, { quantity: +e.target.value })}
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Giá sỉ</Label>
                  <Input
                    type="number"
                    value={it.price}
                    onChange={(e) => updateItem(i, { price: +e.target.value })}
                  />
                </div>
                <div className="col-span-1 text-xs text-right pb-2">
                  {formatVND(it.price * it.quantity)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setItems((x) => x.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addItem}>
              <Plus className="size-4 mr-1" />
              Thêm
            </Button>
            {customer && (
              <p className="text-xs text-muted-foreground">
                Bậc giá: {customer.priceTier} — chiết khấu {(discount * 100).toFixed(0)}% so với giá
                lẻ
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Khách hàng B2B</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(customers || []).filter(Boolean).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {customer && (
              <div className="text-xs text-muted-foreground space-y-0.5 bg-muted/40 p-3 rounded-lg">
                <div>MST: {customer.taxCode}</div>
                <div>Hạn mức: {formatVND(customer.creditLimit)}</div>
                <div>
                  Công nợ hiện tại:{" "}
                  <span className={customer.debt > 0 ? "text-warning font-medium" : ""}>
                    {formatVND(customer.debt)}
                  </span>
                </div>
              </div>
            )}
            <div>
              <Label>Kho xuất</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
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
            <div>
              <Label>Điều khoản thanh toán</Label>
              <Select
                value={paymentTerm}
                onValueChange={(v: B2BOrder["paymentTerm"]) => setPaymentTerm(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                  <SelectItem value="30days">Công nợ 30 ngày</SelectItem>
                  <SelectItem value="60days">Công nợ 60 ngày</SelectItem>
                  <SelectItem value="90days">Công nợ 90 ngày</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>VAT (%)</Label>
              <Input
                type="number"
                value={vatPercent}
                onChange={(e) => setVatPercent(+e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Xuất hóa đơn đỏ</Label>
              <Switch checked={hasRedInvoice} onCheckedChange={setHasRedInvoice} />
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <div className="border-t pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT {vatPercent}%</span>
                <span>{formatVND(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-1">
                <span>Tổng</span>
                <span className="text-primary">{formatVND(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={activeRowIndex !== null} onOpenChange={(open) => !open && setActiveRowIndex(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chọn sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {(products || [])
                .filter((p) => p && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer hover:bg-accent/40 transition"
                    onClick={() => {
                      if (activeRowIndex !== null) {
                        updateItem(activeRowIndex, {
                          productId: p.id,
                          productName: p.name,
                          price: Math.round(p.salePrice * (1 - discount)),
                        });
                        setActiveRowIndex(null);
                        setSearchQuery("");
                      }
                    }}
                  >
                    <img src={p.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"} className="size-9 rounded object-cover" alt="" />
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{formatVND(p.salePrice)} · Tồn: {p.stock}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
