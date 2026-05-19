import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatVND, formatDate } from "@/lib/format";
import type { Customer } from "@/lib/mockData";
import { Mail, Phone, MapPin, Trash2, Edit } from "lucide-react";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Khách hàng — Xus Admin" },
      { name: "description", content: "Quản lý danh sách khách hàng và lịch sử mua hàng." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const customers = useAppStore((s) => s.customers);
  const orders = useAppStore((s) => s.orders);
  const [selected, setSelected] = useState<Customer | null>(null);
  const deleteCustomer = useAppStore((s) => (s as any).deleteCustomer || (() => {}));
  const updateCustomer = useAppStore((s) => s.updateCustomer);

  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  
  const openEdit = (c: Customer) => {
    setEditItem(c);
    setEditForm({ name: c.name, phone: c.phone, email: c.email, address: c.address });
  };

  const saveEdit = () => {
    if (!editItem) return;
    updateCustomer(editItem.id, editForm);
    toast.success("Cập nhật khách hàng thành công");
    setEditItem(null);
  };

  const customerOrders = selected ? (orders || []).filter((o) => o && o.customerId === selected.id) : [];

  return (
    <div>
      <PageHeader title="Khách hàng" description={`${(customers || []).filter(Boolean).length} khách hàng đăng ký`} />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="px-4 py-3 font-medium">Liên hệ</th>
                <th className="px-4 py-3 font-medium">Địa chỉ</th>
                <th className="px-4 py-3 font-medium text-right">Số đơn</th>
                <th className="px-4 py-3 font-medium text-right">Tổng chi tiêu</th>
                <th className="px-4 py-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(customers || []).filter(Boolean).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="border-t border-border/60 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {c.name?.split(" ").pop()?.[0] || "?"}
                      </div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{c.address}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.totalOrders}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatVND(c.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Edit className="size-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Xóa khách hàng này?")) {
                            deleteCustomer(c.id);
                            toast.success("Đã xóa khách hàng");
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Chi tiết khách hàng</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                    {selected.name?.split(" ").pop()?.[0] || "?"}
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{selected.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Tham gia từ {selected.joinedAt ? formatDate(selected.joinedAt) : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    {selected.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    {selected.phone}
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin className="size-4 text-muted-foreground mt-0.5" />
                    {selected.address}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-muted-foreground">Tổng đơn</div>
                    <div className="text-xl font-bold mt-1">{selected.totalOrders}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <div className="text-xs text-muted-foreground">Tổng chi tiêu</div>
                    <div className="text-xl font-bold mt-1 text-primary">
                      {formatVND(selected.totalSpent)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Lịch sử mua hàng</div>
                  {customerOrders.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center bg-muted/40 rounded-lg">
                      Chưa có đơn hàng
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(customerOrders || []).filter(Boolean).map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border text-sm"
                        >
                          <div>
                            <div className="font-medium">{o.code}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(o.createdAt)} · {o.status}
                            </div>
                          </div>
                          <div className="font-semibold tabular-nums">{formatVND(o.total)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
                <Button variant="destructive" onClick={() => {
                  if (confirm("Xóa khách hàng này?")) {
                    deleteCustomer(selected.id);
                    toast.success("Đã xóa khách hàng");
                    setSelected(null);
                  }
                }}>
                  <Trash2 className="size-4 mr-1" /> Xóa
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa thông tin khách hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Họ và tên</Label>
              <Input value={editForm.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại</Label>
              <Input value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={editForm.email || ""} onChange={e => setEditForm({...editForm, email: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Địa chỉ</Label>
              <Input value={editForm.address || ""} onChange={e => setEditForm({...editForm, address: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Hủy</Button>
            <Button onClick={saveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
