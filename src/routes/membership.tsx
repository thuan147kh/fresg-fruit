import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Check, Plus, Trash2, Edit2 } from "lucide-react";
import { formatVND } from "@/lib/format";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import { deleteMembershipTierApi } from "@/lib/supabaseApi";

export const Route = createFileRoute("/membership")({
  head: () => ({ meta: [{ title: "Membership — Xus Admin" }] }),
  component: MembershipPage,
});

function MembershipPage() {
  const memberships = useAppStore((s) => s.memberships);
  const customers = useAppStore((s) => s.customers);
  const deleteMembership = useAppStore((s) => s.deleteMembership);

  const tierOf = (spent: number) => {
    let cur = memberships[0];
    for (const t of memberships) if (spent >= t.minSpent) cur = t;
    return cur;
  };

  return (
    <div>
      <PageHeader
        title="Membership"
        description="Hệ thống hạng thành viên Xus dựa trên tổng chi tiêu — cấu hình từng bậc."
        actions={
          <Link
            to="/membership/new"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            <Plus className="size-4" /> Tạo bậc mới
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(memberships || []).filter(Boolean).map((t, i) => {
          const memberCount = customers.filter((c) => tierOf(c.totalSpent)?.id === t.id).length;
          return (
            <Card key={t.id} className="p-5 card-3d relative overflow-hidden group">
              <div
                className="absolute -top-8 -right-8 size-32 rounded-full opacity-20 blur-2xl"
                style={{ background: t.color }}
              />
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div
                  className="size-12 rounded-2xl flex items-center justify-center text-white shadow-glow"
                  style={{ background: t.color }}
                >
                  {i === memberships.length - 1 ? (
                    <Crown className="size-6" />
                  ) : (
                    <Sparkles className="size-6" />
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Link to="/membership/$id/edit" params={{ id: t.id }}>
                    <Button variant="ghost" size="icon" className="size-7">
                      <Edit2 className="size-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    onClick={() => {
                      deleteMembership(t.id);
                      void deleteMembershipTierApi(t.id).catch(() => {});
                      toast.success("Đã xóa bậc " + t.name);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <h3 className="font-bold text-lg relative z-10">{t.name}</h3>
              <div className="text-xs text-muted-foreground mt-0.5 relative z-10">
                Từ {formatVND(t.minSpent)}
              </div>
              <div className="mt-3 flex items-baseline gap-1 relative z-10">
                <span className="text-3xl font-bold tabular-nums" style={{ color: t.color }}>
                  -{t.discount}%
                </span>
                <span className="text-xs text-muted-foreground">mọi đơn</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1.5 relative z-10 min-h-[80px]">
                {t.perks.map((p) => (
                  <div key={p} className="flex items-start gap-1.5 text-xs">
                    <Check className="size-3.5 text-success shrink-0 mt-0.5" /> <span>{p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between relative z-10">
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{memberCount}</span> thành viên
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 card-3d">
        <h3 className="font-semibold mb-3">Phân bổ thành viên</h3>
        <div className="space-y-3">
          {(memberships || []).filter(Boolean).map((t) => {
            const count = customers.filter((c) => tierOf(c.totalSpent)?.id === t.id).length;
            const pct = customers.length ? Math.round((count / customers.length) * 100) : 0;
            return (
              <div key={t.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">
                    {count} người · {pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: t.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
