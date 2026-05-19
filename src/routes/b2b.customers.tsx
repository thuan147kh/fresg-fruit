import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Building2, Phone, Mail, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { formatVND } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { deleteB2BCustomerApi } from "@/lib/supabaseApi";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

export const Route = createFileRoute("/b2b/customers")({
  head: () => ({ meta: [{ title: "Khách hàng B2B — Xus Admin" }] }),
  component: B2BCustomersPage,
});

const tierLabel: Record<string, string> = {
  wholesale_1: "Sỉ cấp 1",
  wholesale_2: "Sỉ cấp 2",
  wholesale_3: "Sỉ cấp 3 (VIP)",
};

function B2BCustomersPage() {
  const list = useAppStore((s) => s.b2bCustomers);
  const [q, setQ] = useState("");
  const deleteB2BCustomer = useAppStore((s) => s.deleteB2BCustomer);
  const updateB2BCustomer = useAppStore((s) => s.updateB2BCustomer);

  const [editItem, setEditItem] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const filtered = list.filter((c) =>
    [c.companyName, c.taxCode, c.contactName, c.phone].some((x) =>
      x.toLowerCase().includes(q.toLowerCase()),
    ),
  );

  const openEdit = (c: any) => {
    setEditItem(c);
    setEditForm({ companyName: c.companyName, phone: c.phone, email: c.email });
  };

  const saveEdit = () => {
    if (!editItem) return;
    updateB2BCustomer(editItem.id, editForm);
    toast.success("Đã cập nhật thông tin khách B2B");
    setEditItem(null);
  };

  return (
    <div>
      <PageHeader
        title="Khách hàng B2B"
        description="Doanh nghiệp, nhà hàng, siêu thị, chuỗi"
        actions={
          <Link to="/b2b/customers/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"><Plus className="size-4" /> Tạo mới</Link>
        }
      />
      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Tìm theo tên cty, MST, SĐT..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="hover:shadow-elegant transition hover:-translate-y-0.5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div className="flex gap-1">
                  <Badge variant="secondary">{tierLabel[c.priceTier]}</Badge>
                  <Button variant="ghost" size="icon" className="size-6 text-muted-foreground" onClick={() => openEdit(c)}>
                    <Edit className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-destructive"
                    onClick={() => {
                      if (confirm("Xóa khách hàng B2B này?")) {
                        deleteB2BCustomer(c.id);
                        void deleteB2BCustomerApi(c.id).catch(() => {});
                        toast.success("Đã xóa");
                      }
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold leading-tight">{c.companyName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  MST: {c.taxCode} • {c.code}
                </p>
              </div>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5" />
                  {c.contactName} • {c.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5" />
                  {c.email}
                </div>
                {c.contractNo && (
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5" />
                    HĐ: {c.contractNo}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t text-xs">
                <div>
                  <div className="text-muted-foreground">Đơn</div>
                  <div className="font-semibold">{c.totalOrders}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Doanh số</div>
                  <div className="font-semibold text-primary">{formatVND(c.totalSpent)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Công nợ</div>
                  <div className={`font-semibold ${c.debt > 0 ? "text-warning" : ""}`}>
                    {formatVND(c.debt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa nhanh thông tin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div>
              <Label>Tên công ty</Label>
              <Input
                value={editForm.companyName || ""}
                onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label>SĐT</Label>
              <Input
                value={editForm.phone || ""}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
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
