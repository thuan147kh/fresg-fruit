import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

export const Route = createFileRoute("/customers/new")({
  head: () => ({ meta: [{ title: "Tạo khách hàng — Xus Admin" }] }),
  component: CustomersNewPage,
});

function CustomersNewPage() {
  const nav = useNavigate();
  const addCustomer = useAppStore((s) => s.addCustomer);
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "" });

  const submit = () => {
    if (!f.name || !f.phone) {
      toast.error("Nhập tên & SĐT");
      return;
    }
    addCustomer({
      id: `cu-${Date.now()}`,
      ...f,
      totalOrders: 0,
      totalSpent: 0,
      joinedAt: new Date().toISOString().slice(0, 10),
    });
    toast.success("Đã tạo khách hàng");
    nav({ to: "/customers" });
  };

  return (
    <div>
      <PageHeader
        title="Tạo khách hàng mới"
        actions={
          <>
            <Link to="/customers" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
            <Button onClick={submit}>
              <Save className="size-4 mr-1" />
              Lưu
            </Button>
          </>
        }
      />
      <Card className="max-w-2xl">
        <CardContent className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Họ tên *</Label>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div>
            <Label>SĐT *</Label>
            <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Địa chỉ</Label>
            <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
