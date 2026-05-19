import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Printer, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { formatVND, formatDate } from "@/lib/format";

export const Route = createFileRoute("/b2b/invoices")({
  head: () => ({ meta: [{ title: "Hóa đơn đỏ — Xus Admin" }] }),
  component: B2BInvoicesPage,
});

function B2BInvoicesPage() {
  const invoices = useAppStore((s) => s.redInvoices);
  const [selectedId, setSelectedId] = useState<string | null>(invoices[0]?.id ?? null);
  const selected = invoices.find((i) => i.id === selectedId);

  return (
    <div>
      <PageHeader
        title="Hóa đơn đỏ (VAT)"
        description="Quản lý hóa đơn GTGT đã xuất cho khách B2B"
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-3 space-y-1 max-h-[70vh] overflow-y-auto">
            {invoices.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelectedId(inv.id)}
                className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${selectedId === inv.id ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted"}`}
              >
                <div className="size-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                  <FileText className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs">
                    {inv.serialNo}-{inv.invoiceNo}
                  </div>
                  <div className="text-sm font-medium truncate">{inv.companyName}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(inv.issuedAt)} • {formatVND(inv.total)}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-8">
            {selected ? (
              <div
                className="bg-background border-2 border-destructive/30 p-8 rounded-lg space-y-5 print:border-0 print:shadow-none"
                id="invoice-print"
              >
                <div className="text-center space-y-1">
                  <p className="text-sm text-destructive font-semibold tracking-widest">
                    HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mẫu số: 01GTKT0/001 • Ký hiệu: {selected.serialNo}
                  </p>
                  <p className="font-mono text-2xl font-bold text-destructive">
                    Số: {selected.invoiceNo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ngày {formatDate(selected.issuedAt)}
                  </p>
                </div>

                <div className="border-y py-4 space-y-2 text-sm">
                  <div className="font-semibold">Đơn vị bán: CÔNG TY CỔ PHẦN XUS FRESH</div>
                  <div>
                    Mã số thuế: <span className="font-mono">0123456789</span>
                  </div>
                  <div>Địa chỉ: 12 Lê Văn Lương, Q.7, TP.HCM</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="font-semibold">Người mua: {selected.companyName}</div>
                  <div>
                    Mã số thuế: <span className="font-mono">{selected.taxCode}</span>
                  </div>
                </div>

                <table className="w-full text-sm border-collapse">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border p-2 text-left">Nội dung</th>
                      <th className="border p-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">Hàng hóa theo đơn {selected.b2bOrderId}</td>
                      <td className="border p-2 text-right">{formatVND(selected.subtotal)}</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Thuế suất GTGT: {selected.vatPercent}%</td>
                      <td className="border p-2 text-right">{formatVND(selected.vatAmount)}</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="border p-2">Tổng cộng tiền thanh toán</td>
                      <td className="border p-2 text-right text-destructive text-lg">
                        {formatVND(selected.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex items-center justify-between text-sm">
                  <Badge variant={selected.status === "issued" ? "default" : "destructive"}>
                    {selected.status === "issued" ? "Đã phát hành" : "Đã hủy"}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => window.print()}>
                      <Printer className="size-3.5 mr-1" />
                      In
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="size-3.5 mr-1" />
                      Tải XML
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">Chọn 1 hóa đơn để xem</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
