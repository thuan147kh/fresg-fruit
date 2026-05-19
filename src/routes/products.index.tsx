import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { formatVND, formatDate, daysUntil } from "@/lib/format";
import { ProductDetailDialog } from "@/components/products/ProductDetailDialog";
import type { Product } from "@/lib/mockData";
import { deleteProductApi } from "@/lib/supabaseApi";
import { toast } from "sonner";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Sản phẩm — Xus Admin" },
      { name: "description", content: "Quản lý danh mục sản phẩm rau củ quả tươi của sàn Xus." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const products = useAppStore((s) => s.products);
  const deleteProduct = useAppStore((s) => s.deleteProduct);
  const [detail, setDetail] = useState<Product | null>(null);
  const [q, setQ] = useState("");

  const filtered = products.filter((p) =>
    `${p.name} ${p.code} ${p.category}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        description={`Tổng ${products.length} sản phẩm trong hệ thống`}
        actions={
          <Link to="/products/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"><Plus className="size-4" /> Tạo mới</Link>
        }
      />

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="overflow-x-auto -mx-4">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Sản phẩm</th>
                <th className="px-4 py-3 font-medium">Mã SP</th>
                <th className="px-4 py-3 font-medium">Danh mục</th>
                <th className="px-4 py-3 font-medium text-right">Giá bán</th>
                <th className="px-4 py-3 font-medium text-right">Tồn kho</th>
                <th className="px-4 py-3 font-medium">HSD</th>
                <th className="px-4 py-3 font-medium">Loại kho</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(filtered || []).filter(Boolean).map((p) => {
                const days = daysUntil(p.expiryDate);
                const lowStock = p.stock < p.stockThreshold;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setDetail(p)}
                    className="border-t border-border/60 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"}
                          alt={p.name}
                          className="size-10 rounded-lg object-cover bg-muted"
                        />
                        <div className="font-medium">{p.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.code}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {formatVND(p.salePrice)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={lowStock ? "text-destructive font-medium" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          days <= 30
                            ? "text-warning-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {formatDate(p.expiryDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={p.warehouseType === "cold" ? "Kho mát" : "Kho thường"}
                        tone={p.warehouseType === "cold" ? "info" : "muted"}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetail(p);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Link to={`/products/${p.id}/edit`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <Edit className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Xóa sản phẩm này?")) {
                              deleteProduct(p.id);
                              void deleteProductApi(p.id).catch(() => {});
                              toast.success("Đã xóa sản phẩm");
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    Không có sản phẩm
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ProductDetailDialog product={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
