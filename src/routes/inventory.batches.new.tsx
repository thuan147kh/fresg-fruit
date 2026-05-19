import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";

export const Route = createFileRoute("/inventory/batches/new")({
  head: () => ({ meta: [{ title: "Nhập lô hàng mới — Xus Admin" }] }),
  component: BatchNewPage,
});

function BatchNewPage() {
  const nav = useNavigate();
  const products = useAppStore((s) => s.products);
  const warehouses = useAppStore((s) => s.warehouses);
  const addBatch = useAppStore((s) => s.addBatch);

  const [f, setF] = useState({
    code: "",
    warehouseId: warehouses[0]?.id ?? "",
    productionDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
  });

  const [items, setItems] = useState<{ productId: string; location: string; quantity: number; costPrice: number }[]>([
    { productId: products[0]?.id ?? "", location: "", quantity: 0, costPrice: 0 },
  ]);
  
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const calcExpiry = (productionDate: string, days: number) => {
    if (!productionDate) return "";
    const d = new Date(productionDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const submit = () => {
    if (!f.code || !f.expiryDate || items.length === 0) {
      toast.error("Vui lòng nhập mã lô, HSD và ít nhất 1 sản phẩm");
      return;
    }
    
    // Validate items
    for (const item of items) {
      if (!item.productId || item.quantity <= 0) {
        toast.error("Các sản phẩm phải có số lượng > 0");
        return;
      }
    }

    // Create a batch entry for each product
    items.forEach((item, index) => {
      const p = products.find((x) => x && x.id === item.productId);
      if (p) {
        addBatch({
          id: `b-${Date.now()}-${index}`,
          code: f.code,
          productId: p.id,
          productName: p.name,
          warehouseId: f.warehouseId,
          location: item.location,
          quantity: item.quantity,
          productionDate: f.productionDate,
          expiryDate: f.expiryDate,
          costPrice: item.costPrice,
          createdAt: new Date().toISOString().slice(0, 10),
        });
      }
    });

    toast.success("Đã nhập lô hàng gồm nhiều sản phẩm — tồn kho cập nhật");
    nav({ to: "/inventory/stock" });
  };

  return (
    <div>
      <PageHeader
        title="Nhập lô hàng mới"
        description="Tạo mã lô + HSD — tự động cộng vào tồn kho"
        actions={
          <>
            <Link to="/inventory/batches" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
            <Button onClick={submit}>
              <Save className="size-4 mr-1" />
              Lưu lô
            </Button>
          </>
        }
      />
      <Card className="max-w-4xl mb-6">
        <div className="px-6 py-4 border-b font-semibold bg-muted/20">1. Thông tin chung của Lô</div>
        <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>Mã lô *</Label>
            <Input
              value={f.code}
              onChange={(e) => setF({ ...f, code: e.target.value })}
              placeholder="LOT-2026-XX"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Kho lưu trữ *</Label>
            <Select value={f.warehouseId} onValueChange={(v) => setF({ ...f, warehouseId: v })}>
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
            <Label>Ngày sản xuất (NSX)</Label>
            <Input
              type="date"
              value={f.productionDate}
              onChange={(e) => {
                const val = e.target.value;
                setF({
                  ...f,
                  productionDate: val,
                  expiryDate: f.expiryDate ? calcExpiry(val, 30) : f.expiryDate,
                });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Hạn sử dụng (HSD) *</Label>
            <Input
              type="date"
              value={f.expiryDate}
              onChange={(e) => setF({ ...f, expiryDate: e.target.value })}
            />
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setF({ ...f, expiryDate: calcExpiry(f.productionDate, 30) })}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary hover:text-primary-foreground transition"
              >
                +30 ngày
              </button>
              <button
                type="button"
                onClick={() => setF({ ...f, expiryDate: calcExpiry(f.productionDate, 60) })}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary hover:text-primary-foreground transition"
              >
                +60 ngày
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-4xl">
        <div className="px-6 py-4 border-b font-semibold flex items-center justify-between bg-muted/20">
          <span>2. Danh sách sản phẩm trong Lô</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setItems([...items, { productId: products[0]?.id ?? "", location: "", quantity: 0, costPrice: 0 }])}
            className="gap-1 h-8"
          >
            <Plus className="size-3.5" /> Thêm SP
          </Button>
        </div>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                <th className="px-4 py-3 text-left font-medium w-32">Vị trí (Kệ)</th>
                <th className="px-4 py-3 text-right font-medium w-32">Số lượng</th>
                <th className="px-4 py-3 text-right font-medium w-40">Giá nhập (VNĐ)</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      className="w-full text-left justify-start font-normal h-9 truncate"
                      onClick={() => setActiveRowIndex(index)}
                    >
                      {item.productId ? products.find(p => p.id === item.productId)?.name : "Chọn sản phẩm..."}
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      className="h-9"
                      value={item.location}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].location = e.target.value;
                        setItems(newItems);
                      }}
                      placeholder="Kệ A1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      className="h-9 text-right"
                      value={item.quantity || ""}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantity = +e.target.value;
                        setItems(newItems);
                      }}
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      className="h-9 text-right"
                      value={item.costPrice || ""}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].costPrice = +e.target.value;
                        setItems(newItems);
                      }}
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        const newItems = items.filter((_, i) => i !== index);
                        setItems(newItems);
                      }}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Chưa có sản phẩm nào trong lô
            </div>
          )}
        </CardContent>
      </Card>

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
                        const newItems = [...items];
                        newItems[activeRowIndex].productId = p.id;
                        setItems(newItems);
                        setActiveRowIndex(null);
                        setSearchQuery("");
                      }
                    }}
                  >
                    <img src={p.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"} className="size-9 rounded object-cover" alt="" />
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">Tồn: {p.stock}</div>
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
