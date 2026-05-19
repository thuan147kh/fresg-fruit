import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  Megaphone,
  Plus,
  Trash2,
  Power,
  PowerOff,
  CalendarRange,
  Package,
  Edit,
} from "lucide-react";
import { formatDate, formatVND } from "@/lib/format";
import { toast } from "sonner";
import { createPromotion, updatePromotionApi, deletePromotionApi, uploadImage } from "@/lib/supabaseApi";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing — Xus Admin" },
      { name: "description", content: "Tạo và quản lý chương trình khuyến mãi của Xus." },
    ],
  }),
  component: MarketingPage,
});

type PromoType = "combo" | "bogo" | "gift";

function MarketingPage() {
  const products = useAppStore((s) => s.products);
  const promotions = useAppStore((s) => s.promotions);
  const addPromotion = useAppStore((s) => s.addPromotion);
  const updatePromotion = useAppStore((s) => s.updatePromotion);
  const deletePromotion = useAppStore((s) => s.deletePromotion);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<PromoType>("combo");
  const [selected, setSelected] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [banner, setBanner] = useState<string>("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const openEdit = (p: any) => {
    setEditId(p.id);
    setName(p.name);
    setType(p.type);
    setSelected(p.products);
    setStart(p.start);
    setEnd(p.end);
    setDescription(p.description);
    setBanner(p.banner);
    setShowForm(true);
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setBannerFile(f);
      setBanner(URL.createObjectURL(f));
    }
  };

  const resetForm = () => {
    setName("");
    setSelected([]);
    setStart("");
    setEnd("");
    setDescription("");
    setBanner("");
    setBannerFile(null);
    setType("combo");
    setShowForm(false);
  };

  const submit = async () => {
    if (!name || selected.length === 0 || !start || !end) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setSaving(true);
    
    let finalBanner = banner;
    if (bannerFile) {
      try {
        finalBanner = await uploadImage(bannerFile, "banners");
      } catch {
        // Keep local URL
      }
    }

    const payload = {
      id: `pr-${Date.now()}`,
      name,
      type,
      productIds: selected,
      startDate: start,
      endDate: end,
      banner: finalBanner,
      active: true,
    };
    addPromotion(payload);

    // Sync to backend
    void createPromotion({
      name: payload.name,
      type: payload.type,
      product_ids: JSON.stringify(payload.productIds),
      start_date: payload.startDate,
      end_date: payload.endDate,
      banner_url: payload.banner,
      is_active: payload.active,
    }).catch(() => {/* silently fail */});

    toast.success("Tạo chương trình khuyến mãi thành công 🎉");
    resetForm();
    setSaving(false);
  };

  const typeLabel: Record<string, string> = {
    combo: "Combo",
    bogo: "Mua 1 Tặng 1",
    gift: "Mua Tặng Kèm",
  };

  const typeVariant: Record<string, "default" | "secondary" | "outline"> = {
    combo: "default",
    bogo: "secondary",
    gift: "outline",
  };

  const now = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Marketing — Khuyến mãi"
        description="Quản lý các chương trình khuyến mãi và kích hoạt trực tiếp"
        actions={
          <Button onClick={() => setShowForm((v) => !v)} className="gap-2 btn-glow text-primary-foreground">
            <Plus className="size-4" />
            {showForm ? "Đóng form" : "Tạo chương trình"}
          </Button>
        }
      />

      {/* CREATE FORM */}
      {showForm && (
        <Card className="card-3d overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
            <div className="size-8 rounded-lg flex items-center justify-center text-primary-foreground" style={{ backgroundImage: "var(--gradient-primary-vivid)" }}>
              <Megaphone className="size-4" />
            </div>
            <h3 className="font-semibold">Tạo chương trình khuyến mãi</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tên chương trình *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Combo Salad mùa hè"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn về chương trình..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loại khuyến mãi</Label>
                  <RadioGroup
                    value={type}
                    onValueChange={(v) => setType(v as PromoType)}
                    className="grid grid-cols-3 gap-2"
                  >
                    {[
                      { v: "combo", title: "Combo", desc: "Mua combo giảm giá" },
                      { v: "bogo", title: "Mua 1 Tặng 1", desc: "BOGO" },
                      { v: "gift", title: "Mua Tặng Kèm", desc: "Quà đính kèm" },
                    ].map((opt) => (
                      <Label
                        key={opt.v}
                        htmlFor={opt.v}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${type === opt.v ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <RadioGroupItem value={opt.v} id={opt.v} className="mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">{opt.title}</div>
                          <div className="text-xs text-muted-foreground">{opt.desc}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bắt đầu *</Label>
                    <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Kết thúc *</Label>
                    <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Banner</Label>
                  <label className="flex items-center justify-center h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition overflow-hidden bg-muted/40">
                    {banner ? (
                      <img src={banner} className="h-full w-full object-cover" alt="banner" />
                    ) : (
                      <div className="text-center">
                        <Upload className="size-6 mx-auto text-muted-foreground" />
                        <div className="text-xs text-muted-foreground mt-2">Tải banner lên</div>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleBanner} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Sản phẩm áp dụng ({selected.length}) *</Label>
                <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto p-1">
                  {(products || []).filter(Boolean).map((p) => {
                    const activePromos = (promotions || []).filter(pr => pr && pr.active && pr.startDate <= now && pr.endDate >= now && pr.id !== editId);
                    const existingPromo = activePromos.find(pr => pr.productIds.includes(p.id));
                    const isDisabled = !!existingPromo;
                    
                    return (
                      <Label
                        key={p.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
                          selected.includes(p.id) ? "border-primary bg-primary/5" : "border-border"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed bg-muted" : "cursor-pointer"}`}
                      >
                        <Checkbox
                          checked={selected.includes(p.id)}
                          onCheckedChange={() => {
                            if (!isDisabled) toggle(p.id);
                          }}
                          disabled={isDisabled}
                        />
                        <img
                          src={p.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"}
                          className="size-8 rounded object-cover"
                          alt=""
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate flex items-center justify-between">
                            <span>{p.name}</span>
                            {isDisabled && (
                              <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-normal shrink-0">
                                Trùng KM: {existingPromo.name}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{formatVND(p.salePrice)} · Tồn: {p.stock}</div>
                        </div>
                      </Label>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={resetForm} disabled={saving}>Hủy</Button>
                  <Button onClick={submit} disabled={saving} className="gap-2 btn-glow text-primary-foreground">
                    <Megaphone className="size-4" />
                    {saving ? "Đang xử lý..." : "Tạo chương trình"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PROMOTIONS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {promotions.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Megaphone className="size-10 mb-3 opacity-30" />
            <p className="text-sm">Chưa có chương trình khuyến mãi nào</p>
            <Button className="mt-3" onClick={() => setShowForm(true)}>
              <Plus className="size-4 mr-1" /> Tạo ngay
            </Button>
          </div>
        )}
        {(promotions || []).filter(Boolean).map((p) => {
          const isActive = p.active && p.endDate >= now && p.startDate <= now;
          const isExpired = p.endDate < now;
          const promoProducts = products.filter((prod) => p.productIds.includes(prod.id));

          return (
            <Card key={p.id} className="card-3d overflow-hidden group hover:-translate-y-0.5 transition-transform">
              {p.banner && (
                <div className="relative h-32 overflow-hidden">
                  <img src={p.banner} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <Badge
                      variant={isExpired ? "destructive" : isActive ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {isExpired ? "Hết hạn" : isActive ? "Đang chạy" : p.active ? "Chưa bắt đầu" : "Tắt"}
                    </Badge>
                  </div>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{p.name}</h4>
                    <Badge variant={typeVariant[p.type]} className="text-[10px] mt-0.5">
                      {typeLabel[p.type]}
                    </Badge>
                  </div>
                  {!p.banner && (
                    <Badge
                      variant={isExpired ? "destructive" : isActive ? "default" : "secondary"}
                      className="text-[10px] shrink-0"
                    >
                      {isExpired ? "Hết hạn" : isActive ? "Đang chạy" : p.active ? "Chưa bắt đầu" : "Tắt"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <CalendarRange className="size-3.5" />
                  {formatDate(p.startDate)} → {formatDate(p.endDate)}
                </div>

                {promoProducts.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Package className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {(promoProducts || []).filter(Boolean).slice(0, 2).map((x) => x.name).join(", ")}
                      {promoProducts.length > 2 && ` +${promoProducts.length - 2} SP`}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7"
                    onClick={() => {
                      updatePromotion(p.id, { active: !p.active });
                      void updatePromotionApi(p.id, { is_active: !p.active }).catch(() => {});
                      toast.success(p.active ? "Đã tắt chương trình" : "Đã bật chương trình");
                    }}
                  >
                    {p.active ? (
                      <><PowerOff className="size-3.5" /> Tắt</>
                    ) : (
                      <><Power className="size-3.5" /> Bật</>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-foreground"
                    onClick={() => toast.info("Tính năng chỉnh sửa đang phát triển")}
                  >
                    <Edit className="size-3.5" /> Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7 text-destructive hover:text-destructive"
                    onClick={() => {
                      deletePromotion(p.id);
                      void deletePromotionApi(p.id).catch(() => {});
                      toast.success("Đã xóa chương trình");
                    }}
                  >
                    <Trash2 className="size-3.5" /> Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
