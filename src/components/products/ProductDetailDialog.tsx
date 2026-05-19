import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/mockData";
import { formatVND, formatDate, daysUntil } from "@/lib/format";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailDialog({ product, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  if (!product) return null;
  const days = daysUntil(product.expiryDate);
  const profit = product.salePrice - product.costPrice;

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={product.images[activeImg] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-2">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`size-14 rounded-lg overflow-hidden border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={src} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-0.5 rounded">{product.code}</code>
              <StatusBadge
                label={product.warehouseType === "cold" ? "Kho mát" : "Kho thường"}
                tone={product.warehouseType === "cold" ? "info" : "muted"}
              />
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground">Giá gốc</div>
                <div className="font-medium">{formatVND(product.costPrice)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Giá bán</div>
                <div className="font-medium text-primary">{formatVND(product.salePrice)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lợi nhuận</div>
                <div className="font-medium text-success">{formatVND(profit)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hoa hồng CTV</div>
                <div className="font-medium">{product.commission}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tồn kho</div>
                <div className="font-medium">{product.stock}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Định mức</div>
                <div className="font-medium">{product.stockThreshold}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground">HSD</div>
                <div className={`font-medium ${days <= 30 ? "text-warning-foreground" : ""}`}>
                  {formatDate(product.expiryDate)} ({days} ngày)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground">Nhà cung cấp</div>
                <div>{product.supplier}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Khối lượng</div>
                <div>{product.weight}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Kích thước</div>
                <div>{product.dimension}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">SX</div>
                <div>{product.production}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground">Bảo quản</div>
                <div>{product.storage}</div>
              </div>
              {product.note && (
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">Lưu ý</div>
                  <div>{product.note}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
