import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
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
import type { Post } from "@/lib/mockData";

export const Route = createFileRoute("/posts/new")({
  head: () => ({ meta: [{ title: "Tạo bài viết — Xus Admin" }] }),
  component: PostNewPage,
});

function PostNewPage() {
  const nav = useNavigate();
  const addPost = useAppStore((s) => s.addPost);
  const adminUser = useAppStore((s) => s.adminUser);
  const [cover, setCover] = useState("");
  const [f, setF] = useState({
    title: "",
    slug: "",
    category: "Tin tức",
    excerpt: "",
    status: "draft" as Post["status"],
  });

  const submit = () => {
    if (!f.title) {
      toast.error("Nhập tiêu đề");
      return;
    }
    addPost({
      id: `po-${Date.now()}`,
      ...f,
      cover: cover || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
      slug: f.slug || f.title.toLowerCase().replace(/\s+/g, "-").slice(0, 60),
      author: adminUser,
      publishedAt: new Date().toISOString().slice(0, 10),
    });
    toast.success("Đã tạo bài viết");
    nav({ to: "/posts" });
  };

  return (
    <div>
      <PageHeader
        title="Tạo bài viết mới"
        actions={
          <>
            <Link to="/posts" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
            <Button onClick={submit}>
              <Save className="size-4 mr-1" />
              Lưu
            </Button>
          </>
        }
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Tiêu đề *</Label>
              <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={f.slug}
                onChange={(e) => setF({ ...f, slug: e.target.value })}
                placeholder="auto-generate"
              />
            </div>
            <div>
              <Label>Chuyên mục</Label>
              <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
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
            <div className="col-span-2">
              <Label>Mô tả ngắn</Label>
              <Textarea
                rows={3}
                value={f.excerpt}
                onChange={(e) => setF({ ...f, excerpt: e.target.value })}
              />
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select
                value={f.status}
                onValueChange={(v: Post["status"]) => setF({ ...f, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Đăng ngay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-3">
            <Label>Ảnh bìa</Label>
            <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary">
              <Upload className="size-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Chọn ảnh (mock)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && setCover(URL.createObjectURL(e.target.files[0]))
                }
              />
            </label>
            {cover && <img src={cover} className="w-full rounded-lg object-cover aspect-video" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
