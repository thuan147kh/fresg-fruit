import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, FileCheck, FileText, DollarSign, Trash2, Edit } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { formatVND, formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/b2b/orders")({
  head: () => ({ meta: [{ title: "Đơn hàng B2B — Xus Admin" }] }),
  component: B2BOrdersPage,
});

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  confirmed: "secondary",
  delivered: "default",
  paid: "default",
  cancelled: "destructive",
};
const statusLabel: Record<string, string> = {
  draft: "Bản nháp",
  confirmed: "Đã xác nhận",
  delivered: "Đã giao",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy",
};

function B2BOrdersPage() {
  const orders = useAppStore((s) => s.b2bOrders);
  const updateStatus = useAppStore((s) => s.updateB2BOrderStatus);
  const recordPayment = useAppStore((s) => s.recordB2BPayment);
  const issueInvoice = useAppStore((s) => s.issueRedInvoice);
  const deleteOrder = useAppStore((s) => s.deleteB2BOrder);
  const [detail, setDetail] = useState<any>(null);

  return (
    <div>
      <PageHeader
        title="Đơn hàng B2B"
        description="Quản lý đơn sỉ, công nợ & hóa đơn đỏ"
        actions={
          <Link to="/b2b/orders/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"><Plus className="size-4" /> Tạo mới</Link>
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Công ty</TableHead>
                <TableHead className="text-right">Tổng (VAT)</TableHead>
                <TableHead className="text-right">Đã trả</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>HĐ đỏ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders || []).filter(Boolean).map((o) => {
                const debt = o.total - o.paid;
                return (
                  <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetail(o)}>
                    <TableCell className="font-mono text-xs">{o.code}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{o.companyName}</TableCell>
                    <TableCell className="text-right font-semibold">{formatVND(o.total)}</TableCell>
                    <TableCell className="text-right">
                      {formatVND(o.paid)}{" "}
                      {debt > 0 && (
                        <span className="text-xs text-warning block">Còn nợ {formatVND(debt)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {o.paymentTerm === "cash" ? "Tiền mặt" : `Công nợ ${o.paymentTerm}`}
                    </TableCell>
                    <TableCell>
                      {o.redInvoiceNo ? (
                        <Badge variant="default" className="text-[10px]">
                          #{o.redInvoiceNo}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            issueInvoice(o.id);
                            toast.success("Đã xuất hóa đơn đỏ");
                          }}
                        >
                          <FileText className="size-3.5 mr-1" />
                          Xuất
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[o.status]}>{statusLabel[o.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(o.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                         {o.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(o.id, "confirmed");
                              toast.success("Đã xác nhận — trừ kho FEFO");
                            }}
                          >
                            <FileCheck className="size-3.5 mr-1" />
                            Xác nhận
                          </Button>
                        )}
                        {o.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(o.id, "delivered");
                            }}
                          >
                            Đã giao
                          </Button>
                        )}
                        {debt > 0 && o.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              recordPayment(o.id, debt);
                              toast.success("Ghi nhận thanh toán");
                            }}
                          >
                            <DollarSign className="size-3.5 mr-1" />
                            Thu
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Chức năng đang phát triển");
                          }}
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOrder(o.id);
                            toast.success("Đã xóa đơn hàng");
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {detail?.code}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Công ty</div>
                  <div className="font-semibold">{detail.companyName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Trạng thái</div>
                  <Badge variant={statusVariant[detail.status]}>{statusLabel[detail.status]}</Badge>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">SL</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.items.map((it: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{it.productName}</TableCell>
                      <TableCell className="text-right">{it.quantity}</TableCell>
                      <TableCell className="text-right">{formatVND(it.price)}</TableCell>
                      <TableCell className="text-right">{formatVND(it.price * it.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t pt-3 space-y-1 text-right">
                <div className="text-sm">Tạm tính: {formatVND(detail.subtotal)}</div>
                <div className="text-sm">Thuế ({detail.vatPercent}%): {formatVND(detail.vatAmount)}</div>
                <div className="text-lg font-bold text-primary">Tổng cộng: {formatVND(detail.total)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
