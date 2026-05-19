import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, FileText, Upload } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/posts")({
  head: () => ({
    meta: [
      { title: "Bài viết — Xus Admin" },
      {
        name: "description",
        content: "Cấu hình và quản lý bài viết hiển thị trên web app người dùng.",
      },
    ],
  }),
  component: PostsPage,
});

function PostsPage() {
  const posts = useAppStore((s) => s.posts);
  const addPost = useAppStore((s) => s.addPost);
  const updatePost = useAppStore((s) => s.updatePost);
  const deletePost = useAppStore((s) => s.deletePost);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Post | null>(null);
  const [form, setForm] = useState<Omit<Post, "id">>({
    title: "",
    slug: "",
    category: "Tin tức",
    cover: "",
    excerpt: "",
    status: "draft",
    author: "Admin Xus",
    publishedAt: new Date().toISOString().slice(0, 10),
  });

  const openCreate = () => {
    setEdit(null);
    setForm({
      title: "",
      slug: "",
      category: "Tin tức",
      cover: "",
      excerpt: "",
      status: "draft",
      author: "Admin Xus",
      publishedAt: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };
  const openEdit = (p: Post) => {
    setEdit(p);
    setForm(p);
    setOpen(true);
  };

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setForm({ ...form, cover: URL.createObjectURL(f) });
  };

  const submit = () => {
    if (!form.title) {
      toast.error("Nhập tiêu đề");
      return;
    }
    const slug =
      form.slug ||
      form.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    if (edit) {
      updatePost(edit.id, { ...form, slug });
      toast.success("Đã cập nhật bài viết");
    } else {
      addPost({ id: `po-${Date.now()}`, ...form, slug });
      toast.success("Đã tạo bài viết");
    }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Bài viết"
        description="Tạo và quản lý nội dung hiển thị trên web app người dùng."
        actions={
          <Button onClick={openCreate} className="gap-2 btn-glow text-primary-foreground">
            <Plus className="size-4" /> Tạo bài viết
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(posts || []).filter(Boolean).map((p) => (
          <Card key={p.id} className="overflow-hidden card-3d p-0 flex flex-col">
            <div className="aspect-video bg-muted relative overflow-hidden">
              {p.cover ? (
                <img src={p.cover} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <FileText className="size-10" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <StatusBadge
                  label={p.status === "published" ? "Đã đăng" : "Nháp"}
                  tone={p.status === "published" ? "success" : "warning"}
                />
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-card/80 backdrop-blur text-xs font-medium">
                {p.category}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold line-clamp-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">{p.excerpt}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>
                  {p.author} · {formatDate(p.publishedAt)}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => {
                      deletePost(p.id);
                      toast.success("Đã xóa");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Sửa bài viết" : "Tạo bài viết mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tiêu đề</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Slug (auto nếu trống)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Danh mục</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tin tức">Tin tức</SelectItem>
                    <SelectItem value="Mẹo hay">Mẹo hay</SelectItem>
                    <SelectItem value="Dinh dưỡng">Dinh dưỡng</SelectItem>
                    <SelectItem value="Khuyến mãi">Khuyến mãi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Ảnh bìa</Label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/40 text-sm">
                <Upload className="size-4 text-muted-foreground" />{" "}
                <span className="text-muted-foreground">Chọn ảnh từ máy</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
              </label>
              {form.cover && (
                <img
                  src={form.cover}
                  className="mt-2 rounded-md aspect-video w-full object-cover"
                  alt="cover"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Tóm tắt</Label>
              <Textarea
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as "draft" | "published" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Đăng ngay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ngày đăng</Label>
                <Input
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submit} className="btn-glow text-primary-foreground">
              {edit ? "Lưu thay đổi" : "Tạo bài"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
