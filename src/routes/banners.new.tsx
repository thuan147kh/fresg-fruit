import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
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
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import type { Banner } from "@/lib/mockData";

export const Route = createFileRoute("/banners/new")({
  head: () => ({ meta: [{ title: "Tạo banner — Xus Admin" }] }),
  component: BannerNewPage,
});

function BannerNewPage() {
  const nav = useNavigate();
  const promotions = useAppStore((s) => s.promotions);
  const addBanner = useAppStore((s) => s.addBanner);
  const [image, setImage] = useState<string>("");
  const [f, setF] = useState({
    title: "",
    link: "",
    promotionId: "none",
    startDate: "",
    endDate: "",
    position: "home_hero" as Banner["position"],
  });

  const submit = () => {
    if (!f.title || !image) {
      toast.error("Cần tiêu đề & ảnh");
      return;
    }
    addBanner({
      id: `bn-${Date.now()}`,
      title: f.title,
      image,
      link: f.link,
      promotionId: f.promotionId === "none" ? undefined : f.promotionId,
      startDate: f.startDate,
      endDate: f.endDate,
      position: f.position,
    });
    toast.success("Đã tạo banner");
    nav({ to: "/banners" });
  };

  return (
    <div>
      <PageHeader
        title="Tạo banner mới"
        actions={
          <>
            <Link to="/banners" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
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
              <Label>Vị trí</Label>
              <Select
                value={f.position}
                onValueChange={(v: Banner["position"]) => setF({ ...f, position: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_hero">Trang chủ — Hero</SelectItem>
                  <SelectItem value="home_strip">Trang chủ — Strip</SelectItem>
                  <SelectItem value="category_top">Danh mục — Top</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Link CTA</Label>
              <Input
                value={f.link}
                onChange={(e) => setF({ ...f, link: e.target.value })}
                placeholder="/promo/..."
              />
            </div>
            <div>
              <Label>Bắt đầu</Label>
              <Input
                type="date"
                value={f.startDate}
                onChange={(e) => setF({ ...f, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Kết thúc</Label>
              <Input
                type="date"
                value={f.endDate}
                onChange={(e) => setF({ ...f, endDate: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Liên kết với khuyến mãi</Label>
              <Select value={f.promotionId} onValueChange={(v) => setF({ ...f, promotionId: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không liên kết</SelectItem>
                  {promotions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-3">
            <Label>Ảnh banner *</Label>
            <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary">
              <Upload className="size-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Chọn ảnh (mock)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && setImage(URL.createObjectURL(e.target.files[0]))
                }
              />
            </label>
            {image && <img src={image} className="w-full rounded-lg object-cover aspect-video" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
