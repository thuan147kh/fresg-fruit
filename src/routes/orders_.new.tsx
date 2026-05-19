import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Order, OrderItem } from "@/lib/mockData";
import { createOrder } from "@/lib/supabaseApi";

export const Route = createFileRoute("/orders_/new")({
  head: () => ({ meta: [{ title: "Tạo đơn hàng — Xus Admin" }] }),
  component: OrdersNewPage,
});

function OrdersNewPage() {
  const navigate = useNavigate();
  const customers = useAppStore((s) => s.customers);
  const products = useAppStore((s) => s.products);
  const orders = useAppStore((s) => s.orders);
  const batches = useAppStore((s) => s.batches);
  const addOrder = useAppStore((s) => s.addOrder);

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState(customers[0]?.address ?? "");
  
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const addItem = () => {
    const p = products[0];
    if (!p) return;
    const batch = batches.filter((b) => b && b.productId === p.id).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
    setItems((it) => [
      ...it,
      { 
        productId: p.id, 
        productName: p.name, 
        quantity: 1, 
        price: p.salePrice,
        batchCode: batch?.code,
        productionDate: batch?.productionDate,
        expiryDate: batch?.expiryDate
      },
    ]);
  };

  const updateItem = (idx: number, patch: Partial<OrderItem>) =>
    setItems((it) => it.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const submit = async () => {
    const c = customers.find((x) => x && x.id === customerId);
    if (!c || items.length === 0) {
      toast.error("Chọn khách hàng & ít nhất 1 sản phẩm");
      return;
    }
    const code = `XUS-DH-${String(orders.length + 1).padStart(4, "0")}`;
    const o: Order = {
      id: `o-${Date.now()}`,
      code,
      customerId,
      customerName: c.name,
      items,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
      shippingAddress,
    };
    addOrder(o);
    // Sync to backend
    void createOrder({
      code: o.code,
      customer_id: o.customerId,
      customer_name: o.customerName,
      items: JSON.stringify(o.items),
      total: o.total,
      status: o.status,
      shipping_address: o.shippingAddress,
    }).catch(() => {/* silently fail */});
    toast.success("Đã tạo đơn hàng " + code + " 🎉");
    navigate({ to: "/orders" });
  };

  return (
    <div>
      <PageHeader
        title="Tạo đơn hàng mới"
        description="Đơn hàng B2C — bán lẻ"
        actions={
          <>
            <Link to="/orders" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
            <Button onClick={submit}>
              <Save className="size-4 mr-1" />
              Lưu đơn
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Sản phẩm</h3>
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6">
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
                  <Label className="text-xs">Giá</Label>
                  <Input
                    type="number"
                    value={it.price}
                    onChange={(e) => updateItem(i, { price: +e.target.value })}
                  />
                  {it.batchCode && <div className="text-[10px] text-muted-foreground mt-1 truncate">Lô: {it.batchCode} ({it.expiryDate})</div>}
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
              Thêm sản phẩm
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Khách hàng</Label>
              <Select
                value={customerId}
                onValueChange={(v) => {
                  setCustomerId(v);
                  const c = customers.find((x) => x && x.id === v);
                  if (c) setShippingAddress(c.address);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(customers || []).filter(Boolean).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} • {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Địa chỉ giao</Label>
              <Input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
            </div>
            <div className="border-t pt-3 flex items-center justify-between text-lg">
              <span>Tổng tiền</span>
              <span className="font-bold text-primary">{formatVND(total)}</span>
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
                        const batch = batches.filter((b) => b && b.productId === p.id).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
                        updateItem(activeRowIndex, {
                          productId: p.id,
                          productName: p.name,
                          price: p.salePrice,
                          batchCode: batch?.code,
                          productionDate: batch?.productionDate,
                          expiryDate: batch?.expiryDate,
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
