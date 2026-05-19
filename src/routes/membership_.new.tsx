import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Plus, X, Crown, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import { formatVND } from "@/lib/format";
import type { MembershipTier } from "@/lib/mockData";
import { createMembershipTier } from "@/lib/supabaseApi";

export const Route = createFileRoute("/membership_/new")({
  head: () => ({ meta: [{ title: "Tạo bậc thành viên — Xus Admin" }] }),
  component: MembershipNewPage,
});

const DEFAULT_COLOR = "oklch(0.58 0.16 145)"; // Using a primary-like default color

function MembershipNewPage() {
  const navigate = useNavigate();
  const addMembership = useAppStore((s) => s.addMembership);

  const [name, setName] = useState("");
  const [minSpent, setMinSpent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const color = DEFAULT_COLOR;
  const [perks, setPerks] = useState<string[]>([]);
  const [newPerk, setNewPerk] = useState("");
  const [saving, setSaving] = useState(false);

  const addPerk = () => {
    if (newPerk.trim()) {
      setPerks([...perks, newPerk.trim()]);
      setNewPerk("");
    }
  };
  const removePerk = (i: number) => setPerks(perks.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!name.trim()) return toast.error("Nhập tên bậc");
    setSaving(true);
    try {
      const tier: MembershipTier = {
        id: `m-${Date.now()}`,
        name,
        minSpent,
        discount,
        perks,
        color,
      };
      addMembership(tier);

      // Sync to backend
      void createMembershipTier({
        name: tier.name,
        min_spent: tier.minSpent,
        discount: tier.discount,
        perks: JSON.stringify(tier.perks),
        color: tier.color,
      }).catch(() => {/* silently fail */});

      toast.success("Đã tạo bậc thành viên mới 🎉");
      navigate({ to: "/membership" });
    } catch {
      toast.error("Lỗi khi tạo bậc");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/membership"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Quay lại Membership
        </Link>
      </div>
      <PageHeader
        title="Tạo bậc thành viên mới"
        description="Thiết lập ngưỡng chi tiêu, mức giảm giá và quyền lợi của bậc thành viên."
        actions={
          <Button onClick={save} disabled={saving} className="btn-glow text-white gap-2">
            <Save className="size-4" />
            {saving ? "Đang lưu..." : "Lưu bậc"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 card-3d lg:col-span-2 space-y-5">
          <div>
            <Label>Tên bậc *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Vàng, Kim cương..."
              className="mt-1.5 h-11"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Ngưỡng chi tiêu (VND)</Label>
              <Input
                type="number"
                value={minSpent}
                onChange={(e) => setMinSpent(Number(e.target.value))}
                className="mt-1.5 h-11"
              />
              <div className="text-xs text-muted-foreground mt-1">{formatVND(minSpent)}</div>
            </div>
            <div>
              <Label>Mức giảm (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="mt-1.5 h-11"
              />
            </div>
          </div>



          <div>
            <Label>Quyền lợi</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                value={newPerk}
                onChange={(e) => setNewPerk(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPerk())}
                placeholder="VD: Free ship toàn đơn"
                className="h-11"
              />
              <Button type="button" onClick={addPerk} variant="outline" className="gap-1">
                <Plus className="size-4" /> Thêm
              </Button>
            </div>
            <div className="space-y-2 mt-3">
              {perks.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/60"
                >
                  <span className="text-sm">{p}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removePerk(i)}
                    className="size-7"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
              {!perks.length && (
                <p className="text-xs text-muted-foreground italic">Chưa có quyền lợi nào</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5 card-3d h-fit relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Xem trước
          </div>
          <div
            className="absolute -top-8 -right-8 size-32 rounded-full opacity-20 blur-2xl"
            style={{ background: color }}
          />
          <div
            className="size-12 rounded-2xl flex items-center justify-center text-white shadow-glow mb-3 relative z-10"
            style={{ background: color }}
          >
            {discount >= 10 ? <Crown className="size-6" /> : <Sparkles className="size-6" />}
          </div>
          <h3 className="font-bold text-lg relative z-10">{name || "Tên bậc"}</h3>
          <div className="text-xs text-muted-foreground mt-0.5 relative z-10">
            Từ {formatVND(minSpent)}
          </div>
          <div className="mt-3 flex items-baseline gap-1 relative z-10">
            <span className="text-3xl font-bold tabular-nums" style={{ color }}>
              -{discount}%
            </span>
            <span className="text-xs text-muted-foreground">mọi đơn</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border space-y-1.5 relative z-10">
            {perks.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs">
                <span
                  className="size-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: color }}
                />{" "}
                <span>{p}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
