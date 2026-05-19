import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { ArrowLeft, Save, FolderTree, Upload, X, Palette } from "lucide-react";
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
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import { uploadImage, createCategory } from "@/lib/supabaseApi";

export const Route = createFileRoute("/categories_/new")({
  head: () => ({ meta: [{ title: "Tạo danh mục — Xus Admin" }] }),
  component: CategoriesNewPage,
});

function CategoriesNewPage() {
  const navigate = useNavigate();
  const addCategory = useAppStore((s) => s.addCategory);
  const categories = useAppStore((s) => s.categories);
  const products = useAppStore((s) => s.products);
  const adminUser = useAppStore((s) => s.adminUser);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("none");
  const [image, setImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const autoSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === autoSlug(name)) {
      setSlug(autoSlug(val));
    }
  };

  const handleImageFile = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleImageFile(e.dataTransfer.files);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setSaving(true);
    try {
      // Upload image if provided
      let finalImage = image;
      if (imageFile) {
        try {
          finalImage = await uploadImage(imageFile, "categories");
        } catch {
          // Keep local URL
        }
      }

      const payload = {
        id: `c-${Date.now()}`,
        name,
        createdBy: adminUser,
        productCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addCategory(payload);

      // Sync to backend
      void createCategory({
        name: payload.name,
        slug: slug,
        description: description,
        image_url: finalImage,
        parent_id: parentId === "none" ? null : parentId,
        created_by: payload.createdBy,
        is_active: true,
      }).catch(() => {/* silently fail */});

      toast.success("Tạo danh mục thành công! 🎉");
      navigate({ to: "/categories" });
    } catch {
      toast.error("Lỗi khi tạo danh mục");
    } finally {
      setSaving(false);
    }
  };

  // Count products per parent category for stats
  const productsByCategory = categories.reduce<Record<string, number>>((acc, c) => {
    acc[c.name] = products.filter((p) => p.category === c.name).length;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Tạo danh mục mới"
        description="Phân loại sản phẩm theo danh mục để khách hàng dễ tìm kiếm"
        actions={
          <>
            <Link to="/categories" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
            <Button onClick={submit} disabled={saving} className="btn-glow text-primary-foreground">
              <Save className="size-4 mr-1" />
              {saving ? "Đang lưu..." : "Lưu danh mục"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-3d overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
              <div className="size-8 rounded-lg flex items-center justify-center text-primary-foreground" style={{ backgroundImage: "var(--gradient-primary-vivid)" }}>
                <FolderTree className="size-4" />
              </div>
              <h3 className="font-semibold">Thông tin danh mục</h3>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tên danh mục <span className="text-destructive">*</span></Label>
                  <Input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="VD: Rau hữu cơ"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="rau-huu-co"
                    className="mt-1.5 font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Tự động tạo từ tên</p>
                </div>
              </div>

              <div>
                <Label>Mô tả danh mục</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn về danh mục này..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Danh mục cha</Label>
                  <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn danh mục cha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Không có (danh mục gốc)</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({productsByCategory[c.name] ?? 0} SP)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Người tạo</Label>
                  <Input value={adminUser} disabled className="mt-1.5 bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <Card className="card-3d overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-warning/15 text-warning-foreground flex items-center justify-center">
                <Palette className="size-4" />
              </div>
              <h3 className="font-semibold">Ảnh đại diện</h3>
            </div>
            <CardContent className="p-6 space-y-3">
              {!image ? (
                <label
                  className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="size-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-foreground">Tải ảnh danh mục</span>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e.target.files)}
                  />
                </label>
              ) : (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border group">
                  <img src={image} className="w-full h-full object-cover" alt="category" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setImage("");
                        setImageFile(null);
                      }}
                      className="size-10 rounded-full bg-destructive/90 flex items-center justify-center hover:bg-destructive transition"
                    >
                      <X className="size-5 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="card-3d overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FolderTree className="size-4" />
              </div>
              <h3 className="font-semibold">Xem trước</h3>
            </div>
            <CardContent className="p-6">
              <div className="rounded-xl border border-border p-4 bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FolderTree className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{name || "Tên danh mục"}</h4>
                    {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                      <span>0 sản phẩm</span>
                      <span>Hôm nay</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Tạo bởi: <span className="text-foreground font-medium">{adminUser}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing categories */}
          <Card className="card-3d overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60">
              <h3 className="font-semibold text-sm">Danh mục hiện có ({categories.length})</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-sm">
                    <FolderTree className="size-3.5 text-primary shrink-0" />
                    <span className="font-medium truncate">{c.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">
                      {productsByCategory[c.name] ?? c.productCount} SP
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
