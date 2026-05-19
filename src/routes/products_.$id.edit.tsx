import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Upload, X, Eye, ImagePlus, Package, DollarSign, Info, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import { uploadImages, updateProductApi } from "@/lib/supabaseApi";
import { formatVND } from "@/lib/format";
import type { Product, WarehouseType } from "@/lib/mockData";

export const Route = createFileRoute("/products_/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa sản phẩm — Xus Admin" }] }),
  component: ProductEditPage,
});

function ProductEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const categories = useAppStore((s) => s.categories);
  const products = useAppStore((s) => s.products);
  const updateProduct = useAppStore((s) => s.updateProduct);

  const existing = products.find((p) => p && p.id === id);

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    category: categories[0]?.name ?? "",
    description: "",
    supplier: "",
    costPrice: 0,
    salePrice: 0,
    stock: 0,
    commission: 0,
    stockThreshold: 0,
    weight: "",
    dimension: "",
    storage: "",
    production: "",
    note: "",
    warehouseType: "normal" as WarehouseType,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        code: existing.code,
        name: existing.name,
        category: existing.category,
        description: existing.description,
        supplier: existing.supplier,
        costPrice: existing.costPrice,
        salePrice: existing.salePrice,
        stock: existing.stock,
        commission: existing.commission,
        stockThreshold: existing.stockThreshold,
        weight: existing.weight,
        dimension: existing.dimension,
        storage: existing.storage,
        production: existing.production,
        note: existing.note,
        warehouseType: existing.warehouseType,
      });
      setImages(existing.images);
    }
  }, [existing]);



  const profit = form.salePrice - form.costPrice;
  const margin = form.salePrice > 0 ? ((profit / form.salePrice) * 100).toFixed(1) : "0";

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 8 - images.length;
    const newFiles = Array.from(files).slice(0, remaining);
    
    // Show preview immediately with local URLs
    const localUrls = newFiles.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...localUrls]);
    setImageFiles((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const submit = async () => {
    if (!form.code || !form.name) {
      toast.error("Vui lòng nhập mã & tên sản phẩm");
      return;
    }
    if (!form.category) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    setSaving(true);
    try {
      // Try to upload images to Supabase, fall back to local URLs
      let finalImages = images;
      if (imageFiles.length > 0) {
        try {
          setUploading(true);
          const uploaded = await uploadImages(imageFiles, "products");
          finalImages = uploaded;
        } catch {
          // Keep local URLs
        } finally {
          setUploading(false);
        }
      }

      if (finalImages.length === 0) {
        finalImages = ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"];
      }

      const p: Partial<Product> = { ...form, images: finalImages };
      updateProduct(id, p);

      // Sync to backend
      void updateProductApi(id, {
        code: p.code,
        name: p.name,
        category_name: p.category,
        images: p.images,
        description: p.description,
        supplier: p.supplier,
        cost_price: p.costPrice,
        sale_price: p.salePrice,
        stock: p.stock,
        commission: p.commission,
        stock_threshold: p.stockThreshold,
        weight: p.weight,
        dimension: p.dimension,
        storage: p.storage,
        note: p.note,
        warehouse_type: p.warehouseType,
      }).catch(() => {/* silently fail */});

      toast.success("Cập nhật sản phẩm thành công! 🎉");
      navigate({ to: "/products" });
    } catch {
      toast.error("Lỗi khi tạo sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Chỉnh sửa sản phẩm"
        description="Cập nhật thông tin chi tiết và tồn kho"
        actions={
          <>
            <Link to="/products" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
            <Button onClick={submit} disabled={saving || uploading} className="btn-glow text-primary-foreground">
              <Save className="size-4 mr-1" />
              {saving ? "Đang lưu..." : "Lưu sản phẩm"}
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="card-3d overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
              <div className="size-8 rounded-lg flex items-center justify-center text-primary-foreground" style={{ backgroundImage: "var(--gradient-primary-vivid)" }}>
                <Package className="size-4" />
              </div>
              <h3 className="font-semibold">Thông tin cơ bản</h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã sản phẩm <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.code}
                    onChange={(e) => set("code", e.target.value)}
                    placeholder="XUS-XXX-001"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Tên sản phẩm <span className="text-destructive">*</span></Label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Cải bó xôi hữu cơ 300g" className="mt-1.5" />
                </div>
                <div>
                  <Label>Danh mục <span className="text-destructive">*</span></Label>
                  <Select value={form.category} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Loại kho</Label>
                  <Select
                    value={form.warehouseType}
                    onValueChange={(v: WarehouseType) => set("warehouseType", v)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold">❄️ Kho lạnh (2-8°C)</SelectItem>
                      <SelectItem value="normal">📦 Kho thường</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Mô tả sản phẩm</Label>
                  <Textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card className="card-3d overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-info/15 text-info flex items-center justify-center">
                <DollarSign className="size-4" />
              </div>
              <h3 className="font-semibold">Giá & Tồn kho</h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Giá nhập (VNĐ)</Label>
                  <Input
                    type="number"
                    value={form.costPrice || ""}
                    onChange={(e) => set("costPrice", +e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Giá bán (VNĐ)</Label>
                  <Input
                    type="number"
                    value={form.salePrice || ""}
                    onChange={(e) => set("salePrice", +e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Lợi nhuận</Label>
                  <div className={`mt-1.5 h-9 rounded-md border px-3 flex items-center text-sm font-semibold ${profit >= 0 ? "bg-primary/5 text-primary border-primary/20" : "bg-destructive/5 text-destructive border-destructive/20"}`}>
                    {formatVND(profit)} ({margin}%)
                  </div>
                </div>
                <div>
                  <Label>Tồn kho ban đầu</Label>
                  <Input
                    type="number"
                    value={form.stock || ""}
                    onChange={(e) => set("stock", +e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Ngưỡng cảnh báo</Label>
                  <Input
                    type="number"
                    value={form.stockThreshold || ""}
                    onChange={(e) => set("stockThreshold", +e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Hoa hồng CTV (%)</Label>
                  <Input
                    type="number"
                    value={form.commission || ""}
                    onChange={(e) => set("commission", +e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="card-3d overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
                <Info className="size-4" />
              </div>
              <h3 className="font-semibold">Thông tin bổ sung</h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nhà cung cấp</Label>
                  <Input value={form.supplier} onChange={(e) => set("supplier", e.target.value)} placeholder="Nông trại Đà Lạt" className="mt-1.5" />
                </div>
                <div>
                  <Label>Xuất xứ</Label>
                  <Input
                    value={form.production}
                    onChange={(e) => set("production", e.target.value)}
                    placeholder="Đà Lạt, Lâm Đồng"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Khối lượng</Label>
                  <Input value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="300g" className="mt-1.5" />
                </div>
                <div>
                  <Label>Kích thước</Label>
                  <Input value={form.dimension} onChange={(e) => set("dimension", e.target.value)} placeholder="20x15x5cm" className="mt-1.5" />
                </div>
                <div className="col-span-2">
                  <Label>Hướng dẫn bảo quản</Label>
                  <Input value={form.storage} onChange={(e) => set("storage", e.target.value)} placeholder="Bảo quản 2-8°C" className="mt-1.5" />
                </div>
                <div className="col-span-2">
                  <Label>Ghi chú nội bộ</Label>
                  <Textarea
                    rows={2}
                    value={form.note}
                    onChange={(e) => set("note", e.target.value)}
                    placeholder="Ghi chú thêm..."
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - images */}
        <div className="space-y-6">
          <Card className="card-3d overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-warning/15 text-warning-foreground flex items-center justify-center">
                <ImagePlus className="size-4" />
              </div>
              <h3 className="font-semibold">Hình ảnh ({images.length}/8)</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <label
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Upload className="size-6 text-primary" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-foreground">Kéo thả hoặc click để tải ảnh</span>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP (tối đa 8 ảnh)</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group border border-border">
                      <img src={src} className="w-full h-full object-cover" alt={`product-${i}`} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setPreviewImage(src)}
                          className="size-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition"
                        >
                          <Eye className="size-4 text-foreground" />
                        </button>
                        <button
                          onClick={() => removeImage(i)}
                          className="size-8 rounded-full bg-destructive/90 flex items-center justify-center hover:bg-destructive transition"
                        >
                          <X className="size-4 text-white" />
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-medium">
                          Chính
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary card */}
          <Card className="card-3d overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Truck className="size-4" />
              </div>
              <h3 className="font-semibold">Tổng quan</h3>
            </div>
            <CardContent className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã SP</span>
                <span className="font-mono font-medium">{form.code || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Danh mục</span>
                <span className="font-medium">{form.category || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loại kho</span>
                <span className="font-medium">{form.warehouseType === "cold" ? "❄️ Kho lạnh" : "📦 Kho thường"}</span>
              </div>
              <div className="border-t border-border/60 pt-3 flex justify-between">
                <span className="text-muted-foreground">Giá bán</span>
                <span className="font-bold text-primary">{form.salePrice ? formatVND(form.salePrice) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tồn kho</span>
                <span className={`font-medium ${form.stock > 0 ? "text-success" : ""}`}>
                  {form.stock || 0} sản phẩm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ảnh</span>
                <span className="font-medium">{images.length} ảnh</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(o) => !o && setPreviewImage(null)}>
        <DialogContent className="max-w-2xl p-2">
          {previewImage && <img src={previewImage} className="w-full rounded-lg" alt="preview" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
