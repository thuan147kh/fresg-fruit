import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatVND, formatDate } from "@/lib/format";
import { Check, X } from "lucide-react";
import type { Affiliate } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/affiliates")({
  head: () => ({
    meta: [
      { title: "Cộng tác viên — Xus Admin" },
      { name: "description", content: "Quản lý cộng tác viên (CTV) bán hàng của Xus." },
    ],
  }),
  component: AffiliatesPage,
});

const statusMap = {
  pending: { label: "Chờ duyệt", tone: "warning" as const },
  approved: { label: "Đã duyệt", tone: "success" as const },
  rejected: { label: "Từ chối", tone: "danger" as const },
};

function AffiliatesPage() {
  const affiliates = useAppStore((s) => s.affiliates);
  const approve = useAppStore((s) => s.approveAffiliate);
  const reject = useAppStore((s) => s.rejectAffiliate);
  const [selected, setSelected] = useState<Affiliate | null>(null);

  return (
    <div>
      <PageHeader title="Cộng tác viên" description={`${affiliates.length} CTV trong hệ thống`} />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">CTV</th>
                <th className="px-4 py-3 font-medium">Liên hệ</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Doanh số</th>
                <th className="px-4 py-3 font-medium text-right">Hoa hồng</th>
                <th className="px-4 py-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => {
                const s = statusMap[a.status];
                return (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="border-t border-border/60 hover:bg-muted/40 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Tham gia {formatDate(a.joinedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.phone}
                      <br />
                      <span className="text-xs">{a.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={s.label} tone={s.tone} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatVND(a.sales)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-primary">
                      {formatVND(a.commission)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.status === "pending" && (
                        <div
                          className="flex justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-success border-success/30 hover:bg-success/10"
                            onClick={() => {
                              approve(a.id);
                              toast.success(`Đã duyệt CTV ${a.name}`);
                            }}
                          >
                            <Check className="size-3.5" /> Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              reject(a.id);
                              toast.info("Đã từ chối CTV");
                            }}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Chi tiết CTV</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Họ tên:</span>{" "}
                  <span className="font-medium">{selected.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span> {selected.email}
                </div>
                <div>
                  <span className="text-muted-foreground">SĐT:</span> {selected.phone}
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>{" "}
                  <StatusBadge
                    label={statusMap[selected.status].label}
                    tone={statusMap[selected.status].tone}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-muted-foreground">Tổng doanh số</div>
                    <div className="text-lg font-bold mt-1">{formatVND(selected.sales)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <div className="text-xs text-muted-foreground">Hoa hồng</div>
                    <div className="text-lg font-bold mt-1 text-primary">
                      {formatVND(selected.commission)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
