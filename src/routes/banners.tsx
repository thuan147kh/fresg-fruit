import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Banner } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/banners")({
  head: () => ({
    meta: [
      { title: "Banner — Xus Admin" },
      { name: "description", content: "Quản lý banner đang chạy, sắp diễn ra và đã kết thúc." },
    ],
  }),
  component: BannersPage,
});

function BannersPage() {
  const banners = useAppStore((s) => s.banners);
  const promotions = useAppStore((s) => s.promotions);
  const addBanner = useAppStore((s) => s.addBanner);
  const deleteBanner = useAppStore((s) => s.deleteBanner);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Banner, "id">>({
    title: "",
    image: "",
    link: "",
    promotionId: undefined,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    position: "home_hero",
  });

  const today = new Date();
  const running = (banners || []).filter(
    (b) => b && new Date(b.startDate) <= today && new Date(b.endDate) >= today,
  );
  const upcoming = (banners || []).filter((b) => b && new Date(b.startDate) > today);
  const ended = (banners || []).filter((b) => b && new Date(b.endDate) < today);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setForm({ ...form, image: URL.createObjectURL(f) });
  };

  const submit = () => {
    if (!form.title || !form.image || !form.endDate) {
      toast.error("Nhập đủ thông tin");
      return;
    }
    addBanner({ id: `bn-${Date.now()}`, ...form });
    toast.success("Đã tạo banner");
    setOpen(false);
    setForm({ ...form, title: "", image: "", link: "", promotionId: undefined, endDate: "" });
  };

  const renderList = (list: Banner[], emptyText: string) =>
    list.length === 0 ? (
      <Card className="p-12 text-center text-muted-foreground">
        <ImageIcon className="size-10 mx-auto mb-2 opacity-50" />
        {emptyText}
      </Card>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {list.map((b) => {
          const promo = promotions.find((p) => p && p.id === b.promotionId);
          return (
            <Card key={b.id} className="overflow-hidden p-0 card-3d">
              <div className="aspect-[3/1] bg-muted relative">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-card/80 backdrop-blur text-[11px] font-medium">
                  {b.position.replace("_", " ")}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold flex-1">{b.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      deleteBanner(b.id);
                      toast.success("Đã xóa");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDate(b.startDate)} → {formatDate(b.endDate)}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-muted-foreground">Link:</span>
                  <code className="text-primary">{b.link}</code>
                </div>
                {promo && (
                  <div className="mt-2 text-xs">
                    <StatusBadge label={`KM: ${promo.name}`} tone="info" />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Banner"
        description="Quản lý banner trang chủ, link với chương trình khuyến mãi."
        actions={
          <Button onClick={() => setOpen(true)} className="gap-2 btn-glow text-primary-foreground">
            <Plus className="size-4" /> Tạo banner
          </Button>
        }
      />

      <Tabs defaultValue="running">
        <TabsList className="mb-4">
          <TabsTrigger value="running" className="gap-2">
            Đang chạy
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-semibold">
              {running.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            Sắp diễn ra
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning-foreground font-semibold">
              {upcoming.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="ended" className="gap-2">
            Đã kết thúc
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
              {ended.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="running">
          {renderList(running, "Không có banner nào đang chạy")}
        </TabsContent>
        <TabsContent value="upcoming">
          {renderList(upcoming, "Chưa có banner sắp diễn ra")}
        </TabsContent>
        <TabsContent value="ended">{renderList(ended, "Chưa có banner đã kết thúc")}</TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo banner mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tiêu đề</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ảnh banner (3:1)</Label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/40 text-sm">
                <Upload className="size-4" />{" "}
                <span className="text-muted-foreground">Chọn ảnh</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
              {form.image && (
                <img
                  src={form.image}
                  className="rounded mt-2 aspect-[3/1] w-full object-cover"
                  alt=""
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Link điều hướng</Label>
              <Input
                placeholder="/promo/..."
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Liên kết khuyến mãi (tùy chọn)</Label>
              <Select
                value={form.promotionId ?? "none"}
                onValueChange={(v) =>
                  setForm({ ...form, promotionId: v === "none" ? undefined : v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Không liên kết —</SelectItem>
                  {(promotions || []).filter(Boolean).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vị trí hiển thị</Label>
              <Select
                value={form.position}
                onValueChange={(v) => setForm({ ...form, position: v as Banner["position"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_hero">Trang chủ - Hero</SelectItem>
                  <SelectItem value="home_strip">Trang chủ - Strip</SelectItem>
                  <SelectItem value="category_top">Danh mục - Trên cùng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bắt đầu</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kết thúc</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submit} className="btn-glow text-primary-foreground">
              Tạo banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
