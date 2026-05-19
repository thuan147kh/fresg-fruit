import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatVND, formatDateTime } from "@/lib/format";
import { Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders_/handover")({
  head: () => ({
    meta: [
      { title: "Bàn giao đơn hàng — Xus Admin" },
      { name: "description", content: "Giao diện bàn giao đơn hàng cho đơn vị vận chuyển." },
    ],
  }),
  component: HandoverPage,
});

function HandoverPage() {
  const orders = useAppStore((s) => s.orders);
  const warehouses = useAppStore((s) => s.warehouses);
  const setPicked = useAppStore((s) => s.setHandoverPicked);
  const [tab, setTab] = useState<"waiting" | "picked">("waiting");

  const waiting = (orders || []).filter(
    (o) => o && o.status === "shipping" && o.handoverStatus === "waiting",
  );
  const picked = (orders || []).filter(
    (o) => o && (o.handoverStatus === "picked" || (o.status === "shipping" && o.handoverStatus !== "waiting")),
  );
  const list = tab === "waiting" ? waiting : picked;
  const warehouseName = (id?: string) => warehouses.find((w) => w && w.id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="Bàn giao đơn hàng"
        description="Bàn giao đơn cho đơn vị vận chuyển (ĐVVC)"
      />

      <div className="rounded-2xl bg-primary-soft border border-primary/20 p-4 mb-4 flex items-start gap-3 shadow-3d">
        <div
          className="size-10 rounded-xl text-primary-foreground flex items-center justify-center shrink-0 shadow-glow"
          style={{ backgroundImage: "var(--gradient-primary-vivid)" }}
        >
          <Truck className="size-5" />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-primary">Quy trình bàn giao</div>
          <div className="text-muted-foreground mt-0.5">
            Đơn ở tab <b>Chờ lấy hàng</b> là đơn đã được Admin xác nhận và chọn kho xuất. Khi nhân
            viên kho bàn giao xong, đơn tự động chuyển sang <b>Đang giao</b> ở Quản lý đơn hàng, sau
            đó dùng nút <b>Hoàn thành</b> ở đó để kết thúc đơn.
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "waiting" | "picked")}>
        <TabsList className="mb-4">
          <TabsTrigger value="waiting" className="gap-2">
            Chờ lấy hàng
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning-foreground font-semibold">
              {waiting.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="picked" className="gap-2">
            Đã lấy hàng
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-semibold">
              {picked.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <Card className="p-0 overflow-hidden card-3d">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Mã đơn</th>
                    <th className="px-4 py-3 font-medium">Khách hàng</th>
                    <th className="px-4 py-3 font-medium">Kho xuất</th>
                    <th className="px-4 py-3 font-medium">Địa chỉ</th>
                    <th className="px-4 py-3 font-medium text-right">Tổng</th>
                    <th className="px-4 py-3 font-medium">Thời gian</th>
                    <th className="px-4 py-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {(list || []).filter(Boolean).map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-border/60 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{o.code}</td>
                      <td className="px-4 py-3">{o.customerName}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {warehouseName(o.warehouseId)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {o.shippingAddress}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatVND(o.total)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(o.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {tab === "waiting" ? (
                          <Button
                            size="sm"
                            className="gap-1.5 btn-glow text-primary-foreground"
                            onClick={() => {
                              setPicked(o.id);
                              toast.success(
                                `Đã bàn giao ${o.code} cho ĐVVC. Đơn chuyển sang Đang giao.`,
                              );
                            }}
                          >
                            <Truck className="size-3.5" /> Bàn giao cho ĐVVC
                          </Button>
                        ) : (
                          <span className="text-xs text-success font-medium">✓ Đang giao hàng</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        {tab === "waiting"
                          ? "Chưa có đơn nào chờ lấy hàng. Hãy duyệt đơn ở Quản lý đơn hàng trước."
                          : "Chưa có đơn nào đã lấy hàng."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
