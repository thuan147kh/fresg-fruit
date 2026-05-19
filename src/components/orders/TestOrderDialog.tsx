import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { formatVND } from "@/lib/format";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestOrderDialog({ open, onOpenChange }: Props) {
  const customers = useAppStore((s) => s.customers);
  const products = useAppStore((s) => s.products);
  const addOrder = useAppStore((s) => s.addOrder);
  const orders = useAppStore((s) => s.orders);
  const promotions = useAppStore((s) => s.promotions);
  const vouchers = useAppStore((s) => s.vouchers);

  const [customerId, setCustomerId] = useState("");
  const [selected, setSelected] = useState<{ id: string; qty: number }[]>([]);
  const [voucherId, setVoucherId] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setCustomerId((customers || []).filter(Boolean)[0]?.id ?? "");
      setSelected([]);
      setVoucherId("");
    }
  }, [open, customers]);

  const toggle = (id: string) => {
    setSelected((s) =>
      s.some((x) => x.id === id) ? s.filter((x) => x.id !== id) : [...s, { id, qty: 1 }],
    );
  };

  const nowStr = new Date().toISOString().slice(0, 10);
  const activePromos = (promotions || []).filter(
    (pr) => pr && pr.active && pr.startDate <= nowStr && pr.endDate >= nowStr
  );

  const getProductPromo = (pId: string) => {
    return activePromos.find((pr) => pr && pr.productIds && pr.productIds.includes(pId));
  };

  const items = selected.map((s) => {
    const p = (products || []).find((x) => x && x.id === s.id);
    if (!p) return null;
    const promo = getProductPromo(p.id);
    const discountPercent = promo ? 10 : 0;
    const finalPrice = p.salePrice * (1 - discountPercent / 100);
    return {
      productId: s.id,
      productName: p.name,
      quantity: s.qty,
      price: finalPrice,
      originalPrice: p.salePrice,
      promoName: promo?.name,
    };
  }).filter(Boolean) as {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    originalPrice: number;
    promoName?: string;
  }[];

  const totalBeforeVoucher = items.reduce((s, it) => s + it.price * it.quantity, 0);

  const selectedVoucher = (vouchers || []).find((v) => v && v.id === voucherId);
  let voucherDiscount = 0;
  if (selectedVoucher && totalBeforeVoucher >= selectedVoucher.minOrder) {
    if (selectedVoucher.type === "percent") {
      voucherDiscount = totalBeforeVoucher * (selectedVoucher.value / 100);
    } else if (selectedVoucher.type === "fixed") {
      voucherDiscount = selectedVoucher.value;
    }
  }

  const finalTotal = Math.max(0, totalBeforeVoucher - voucherDiscount);

  const submit = () => {
    const customer = (customers || []).filter(Boolean).find((c) => c.id === customerId);
    if (!customer || items.length === 0) {
      toast.error("Vui lòng chọn khách hàng và sản phẩm");
      return;
    }
    addOrder({
      id: `o-${Date.now()}`,
      code: `XUS-DH-${String(orders.length + 1).padStart(4, "0")}`,
      customerId,
      customerName: customer.name,
      items: items.map(it => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        price: it.price,
      })),
      total: finalTotal,
      status: "pending",
      shippingAddress: customer.address,
      createdAt: new Date().toISOString(),
    });
    toast.success("Tạo đơn test thành công — vào tab Chờ xác nhận");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn test</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Khách hàng</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(customers || []).filter(Boolean).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <Label>Sản phẩm đã chọn ({selected.length})</Label>
              <Button size="sm" variant="outline" onClick={() => setShowPicker(true)}>
                Chọn sản phẩm
              </Button>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-6 border rounded-lg text-muted-foreground text-sm bg-muted/20">
                Chưa chọn sản phẩm nào. Bấm nút Chọn sản phẩm ở trên.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.productId} className="flex items-center justify-between p-2.5 border rounded-lg bg-card text-sm">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-medium truncate">{it.productName}</div>
                      <div className="text-xs flex flex-wrap gap-x-2 items-center text-muted-foreground mt-0.5">
                        {it.promoName ? (
                          <>
                            <span className="line-through">{formatVND(it.originalPrice)}</span>
                            <span className="text-destructive font-semibold">{formatVND(it.price)}</span>
                            <span className="text-[10px] bg-destructive/10 text-destructive px-1 rounded">
                              KM -10%: {it.promoName}
                            </span>
                          </>
                        ) : (
                          <span>{formatVND(it.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="h-8 w-14 text-center"
                        value={it.quantity}
                        min={1}
                        onChange={(e) => {
                          const val = Math.max(1, +e.target.value);
                          setSelected(prev => prev.map(x => x.id === it.productId ? { ...x, qty: val } : x));
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setSelected(prev => prev.filter(x => x.id !== it.productId))}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Áp dụng Voucher</Label>
            <Select value={voucherId} onValueChange={setVoucherId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn voucher giảm giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_voucher">Không dùng voucher</SelectItem>
                {(vouchers || []).filter(v => v && v.active).map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.code} — Giảm {v.type === "percent" ? `${v.value}%` : formatVND(v.value)} (Đơn tối thiểu {formatVND(v.minOrder)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tạm tính (sau KM sản phẩm)</span>
              <span className="font-semibold">{formatVND(totalBeforeVoucher)}</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between items-center text-destructive">
                <span>Voucher giảm giá</span>
                <span>-{formatVND(voucherDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary text-base font-bold">
              <span>Tổng cộng đơn test</span>
              <span className="text-primary">{formatVND(finalTotal)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={submit}>Tạo đơn</Button>
        </DialogFooter>
      </DialogContent>

      {/* SECOND DIALOG: PRODUCT LIST PICKER */}
      <Dialog open={showPicker} onOpenChange={setShowPicker}>
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
                .filter(p => p && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((p) => {
                  const sel = selected.find((x) => x.id === p.id);
                  const promo = getProductPromo(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition hover:bg-accent/40 ${
                        sel ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => toggle(p.id)}
                    >
                      <Checkbox checked={!!sel} onCheckedChange={() => {}} />
                      <img src={p.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"} className="size-9 rounded object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground flex gap-2 items-center mt-0.5">
                          {promo ? (
                            <>
                              <span className="line-through">{formatVND(p.salePrice)}</span>
                              <span className="text-destructive font-semibold">{formatVND(p.salePrice * 0.9)}</span>
                            </>
                          ) : (
                            <span>{formatVND(p.salePrice)}</span>
                          )}
                          <span>· Tồn: {p.stock}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowPicker(false)} className="w-full">
                Xong
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
