import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import type { B2BCustomer } from "@/lib/mockData";
import { createB2BCustomer } from "@/lib/supabaseApi";

export const Route = createFileRoute("/b2b/customers_/new")({
  head: () => ({ meta: [{ title: "Tạo KH B2B — Xus Admin" }] }),
  component: B2BCustomerNew,
});

function B2BCustomerNew() {
  const nav = useNavigate();
  const list = useAppStore((s) => s.b2bCustomers);
  const addB2BCustomer = useAppStore((s) => s.addB2BCustomer);
  const [f, setF] = useState({
    companyName: "",
    taxCode: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    bankAccount: "",
    bankName: "",
    contractNo: "",
    contractStart: "",
    contractEnd: "",
    creditLimit: 0,
    priceTier: "wholesale_1" as B2BCustomer["priceTier"],
  });

  const submit = async () => {
    if (!f.companyName || !f.taxCode) {
      toast.error("Nhập tên công ty & MST");
      return;
    }
    const code = `B2B-${String(list.length + 1).padStart(4, "0")}`;
    const payload: B2BCustomer = {
      id: `b2b-${Date.now()}`,
      code,
      ...f,
      debt: 0,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    // Optimistic update
    addB2BCustomer(payload);
    // Sync to backend
    void createB2BCustomer({
      code: payload.code,
      company_name: payload.companyName,
      tax_code: payload.taxCode,
      contact_name: payload.contactName,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      bank_account: payload.bankAccount,
      bank_name: payload.bankName,
      contract_no: payload.contractNo,
      contract_start: payload.contractStart,
      contract_end: payload.contractEnd,
      credit_limit: payload.creditLimit,
      price_tier: payload.priceTier,
    }).catch(() => {/* silently fail - local store already updated */});
    toast.success("Đã tạo KH B2B 🎉");
    nav({ to: "/b2b/customers" });
  };

  return (
    <div>
      <PageHeader
        title="Tạo khách hàng B2B"
        description="Doanh nghiệp / nhà hàng / siêu thị"
        actions={
          <>
            <Link to="/b2b/customers" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
            <Button onClick={submit}>
              <Save className="size-4 mr-1" />
              Lưu
            </Button>
          </>
        }
      />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Thông tin doanh nghiệp</h3>
            <div>
              <Label>Tên công ty *</Label>
              <Input
                value={f.companyName}
                onChange={(e) => setF({ ...f, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label>Mã số thuế *</Label>
              <Input value={f.taxCode} onChange={(e) => setF({ ...f, taxCode: e.target.value })} />
            </div>
            <div>
              <Label>Địa chỉ đăng ký</Label>
              <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Người liên hệ</Label>
                <Input
                  value={f.contactName}
                  onChange={(e) => setF({ ...f, contactName: e.target.value })}
                />
              </div>
              <div>
                <Label>SĐT</Label>
                <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Tài chính & Hợp đồng</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Số TK</Label>
                <Input
                  value={f.bankAccount}
                  onChange={(e) => setF({ ...f, bankAccount: e.target.value })}
                />
              </div>
              <div>
                <Label>Ngân hàng</Label>
                <Input
                  value={f.bankName}
                  onChange={(e) => setF({ ...f, bankName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Hạn mức công nợ (VND)</Label>
              <Input
                type="number"
                value={f.creditLimit}
                onChange={(e) => setF({ ...f, creditLimit: +e.target.value })}
              />
            </div>
            <div>
              <Label>Bậc giá sỉ</Label>
              <Select
                value={f.priceTier}
                onValueChange={(v: B2BCustomer["priceTier"]) => setF({ ...f, priceTier: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wholesale_1">Sỉ cấp 1 (5%)</SelectItem>
                  <SelectItem value="wholesale_2">Sỉ cấp 2 (10%)</SelectItem>
                  <SelectItem value="wholesale_3">Sỉ cấp 3 — VIP (15%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Số hợp đồng</Label>
              <Input
                value={f.contractNo}
                onChange={(e) => setF({ ...f, contractNo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>HĐ từ</Label>
                <Input
                  type="date"
                  value={f.contractStart}
                  onChange={(e) => setF({ ...f, contractStart: e.target.value })}
                />
              </div>
              <div>
                <Label>HĐ đến</Label>
                <Input
                  type="date"
                  value={f.contractEnd}
                  onChange={(e) => setF({ ...f, contractEnd: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
