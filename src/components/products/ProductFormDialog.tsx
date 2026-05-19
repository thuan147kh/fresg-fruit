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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Upload, X, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import type { Product, WarehouseType } from "@/lib/mockData";
import { formatVND } from "@/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductFormDialog({ open, onOpenChange }: Props) {
  const categories = useAppStore((s) => s.categories);
  const addProduct = useAppStore((s) => s.addProduct);

  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "",
    description: "",
    supplier: "",
    costPrice: 0,
    salePrice: 0,
    productionDate: "",
    expiryDate: "",
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
  const [images, setImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [doc, setDoc] = useState<string>("");

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        code: `XUS-${Date.now().toString().slice(-6)}`,
        category: categories[0]?.name ?? "",
        description: "",
        supplier: "",
        costPrice: 0,
        salePrice: 0,
        productionDate: "",
        expiryDate: "",
        stock: 0,
        commission: 0,
        stockThreshold: 0,
        weight: "",
        dimension: "",
        storage: "",
        production: "",
        note: "",
        warehouseType: "normal",
      });
      setImages([]);
      setDoc("");
    }
  }, [open, categories]);

  const profit = form.salePrice - form.costPrice;

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 8 - images.length;
    const urls = files.slice(0, remaining).map((f) => URL.createObjectURL(f));
    setImages((cur) => [...cur, ...urls]);
  };

  const removeImage = (idx: number) => setImages((cur) => cur.filter((_, i) => i !== idx));

  const handleDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setDoc(f.name);
  };

  const submit = () => {
    if (!form.name || !form.category) {
      toast.error("Vui lòng nhập tên và danh mục");
      return;
    }
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      ...form,
      images: images.length
        ? images
        : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"],
    };
    addProduct(newProduct);
    toast.success("Tạo sản phẩm thành công");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo sản phẩm mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên sản phẩm *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Cải bó xôi hữu cơ"
                />
              </div>
              <div className="space-y-2">
                <Label>Mã sản phẩm</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn" />
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
                    <SelectItem value="cold">Kho mát (2-8°C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="space-y-2">
              <Label>Hình ảnh sản phẩm ({images.length}/8)</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                  >
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button
                      onClick={() => setPreviewImage(src)}
                      className="absolute inset-0 bg-black/0 hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                      type="button"
                    >
                      <Eye className="size-4 text-white" />
                    </button>
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      type="button"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {images.length < 8 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition">
                    <Upload className="size-5" />
                    <span className="text-[10px] mt-1">Tải lên</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImages}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </section>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nhà cung cấp</Label>
                <Input
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hạn sử dụng</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Giá gốc (VNĐ)</Label>
                <Input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: +e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Giá bán (VNĐ)</Label>
                <Input
                  type="number"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: +e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Lợi nhuận (auto)</Label>
                <Input
                  disabled
                  value={formatVND(profit)}
                  className="bg-primary-soft text-primary font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label>Tồn kho</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: +e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>% Hoa hồng CTV</Label>
                <Input
                  type="number"
                  value={form.commission}
                  onChange={(e) => setForm({ ...form, commission: +e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Định mức tồn kho</Label>
                <Input
                  type="number"
                  value={form.stockThreshold}
                  onChange={(e) => setForm({ ...form, stockThreshold: +e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Khối lượng</Label>
                <Input
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="300g"
                />
              </div>
              <div className="space-y-2">
                <Label>Kích thước</Label>
                <Input
                  value={form.dimension}
                  onChange={(e) => setForm({ ...form, dimension: e.target.value })}
                  placeholder="20x15x5cm"
                />
              </div>
            </section>

            <div className="space-y-2">
              <Label>Hướng dẫn bảo quản</Label>
              <Textarea
                rows={2}
                value={form.storage}
                onChange={(e) => setForm({ ...form, storage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Thông tin sản xuất</Label>
              <Textarea
                rows={2}
                value={form.production}
                onChange={(e) => setForm({ ...form, production: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lưu ý</Label>
              <Textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Giấy công bố sản phẩm</Label>
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer">
                <FileText className="size-5 text-muted-foreground" />
                <div className="flex-1 text-sm">
                  {doc || <span className="text-muted-foreground">Chọn file PDF/DOC...</span>}
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleDoc}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={submit}>Tạo sản phẩm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={(o) => !o && setPreviewImage(null)}>
        <DialogContent className="max-w-2xl">
          {previewImage && <img src={previewImage} className="w-full rounded-lg" alt="preview" />}
        </DialogContent>
      </Dialog>
    </>
  );
}
