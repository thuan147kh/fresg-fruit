import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderTree, Trash2, Search, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteCategoryApi, updateCategory as updateCategoryApi } from "@/lib/supabaseApi";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Danh mục — Xus Admin" },
      { name: "description", content: "Quản lý danh mục sản phẩm Xus." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const categories = useAppStore((s) => s.categories);
  const products = useAppStore((s) => s.products);
  const deleteCategory = useAppStore((s) => s.deleteCategory);
  const [q, setQ] = useState("");

  // Compute real product count from products array
  const categoriesWithCount = categories.map((c) => ({
    ...c,
    realProductCount: products.filter((p) => p.category === c.name).length,
  }));

  const filtered = categoriesWithCount.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()),
  );

  const [editItem, setEditItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const updateCategory = useAppStore((s) => s.updateCategory);

  const openEdit = (c: any) => {
    setEditItem(c);
    setEditForm({
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
    });
  };

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
    setEditForm(prev => {
      const slug = prev.slug === autoSlug(prev.name) || !prev.slug ? autoSlug(val) : prev.slug;
      return { ...prev, name: val, slug };
    });
  };

  const saveEdit = () => {
    if (!editForm.name.trim() || !editItem) return;
    updateCategory(editItem.id, editForm);
    void updateCategoryApi(editItem.id, editForm as any).catch(() => {});
    toast.success("Cập nhật danh mục thành công");
    setEditItem(null);
  };

  return (
    <div>
      <PageHeader
        title="Danh mục"
        description={`${categories.length} danh mục đang hoạt động`}
        actions={
          <Link to="/categories/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"><Plus className="size-4" /> Tạo mới</Link>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm danh mục..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="p-5 hover:shadow-md transition-shadow group card-3d">
            <div className="flex items-start justify-between gap-3">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FolderTree className="size-5" />
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(c)}
                >
                  <Edit className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition text-destructive"
                  onClick={() => {
                    if (confirm("Xác nhận xóa danh mục này?")) {
                      deleteCategory(c.id);
                      void deleteCategoryApi(c.id).catch(() => {});
                      toast.success("Đã xóa danh mục");
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold mt-3">{c.name}</h3>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{c.realProductCount} sản phẩm</span>
              <span>{formatDate(c.createdAt)}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Tạo bởi: <span className="text-foreground font-medium">{c.createdBy}</span>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Không tìm thấy danh mục nào
          </div>
        )}
      </div>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Tên danh mục</Label>
              <Input value={editForm.name} onChange={(e) => handleNameChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (URL)</Label>
              <Input value={editForm.slug} onChange={(e) => setEditForm(prev => ({...prev, slug: e.target.value}))} className="font-mono text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Textarea 
                value={editForm.description} 
                onChange={(e) => setEditForm(prev => ({...prev, description: e.target.value}))} 
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Hủy</Button>
            <Button onClick={saveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
