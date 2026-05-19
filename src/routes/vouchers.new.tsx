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
import type { Voucher } from "@/lib/mockData";

export const Route = createFileRoute("/vouchers/new")({
  head: () => ({ meta: [{ title: "Tạo voucher — Xus Admin" }] }),
  component: VoucherNewPage,
});

function VoucherNewPage() {
  const nav = useNavigate();
  const addVoucher = useAppStore((s) => s.addVoucher);
  const [f, setF] = useState({
    code: "",
    name: "",
    type: "percent" as Voucher["type"],
    value: 0,
    minOrder: 0,
    quota: 100,
    startDate: "",
    endDate: "",
  });

  const submit = () => {
    if (!f.code || !f.name) {
      toast.error("Nhập mã & tên voucher");
      return;
    }
    addVoucher({ id: `v-${Date.now()}`, ...f, used: 0, active: true });
    toast.success("Đã tạo voucher");
    nav({ to: "/vouchers" });
  };

  return (
    <div>
      <PageHeader
        title="Tạo voucher mới"
        actions={
          <>
            <Link to="/vouchers" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
            <Button onClick={submit}>
              <Save className="size-4 mr-1" />
              Lưu
            </Button>
          </>
        }
      />
      <Card className="max-w-3xl">
        <CardContent className="p-6 grid grid-cols-2 gap-4">
          <div>
            <Label>Mã code *</Label>
            <Input
              value={f.code}
              onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })}
              placeholder="XUS50K"
            />
          </div>
          <div>
            <Label>Tên hiển thị *</Label>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div>
            <Label>Loại</Label>
            <Select value={f.type} onValueChange={(v: Voucher["type"]) => setF({ ...f, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Giảm theo %</SelectItem>
                <SelectItem value="fixed">Giảm số tiền cố định</SelectItem>
                <SelectItem value="shipping">Miễn phí vận chuyển</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Giá trị</Label>
            <Input
              type="number"
              value={f.value}
              onChange={(e) => setF({ ...f, value: +e.target.value })}
            />
          </div>
          <div>
            <Label>Đơn tối thiểu</Label>
            <Input
              type="number"
              value={f.minOrder}
              onChange={(e) => setF({ ...f, minOrder: +e.target.value })}
            />
          </div>
          <div>
            <Label>Số lượng</Label>
            <Input
              type="number"
              value={f.quota}
              onChange={(e) => setF({ ...f, quota: +e.target.value })}
            />
          </div>
          <div>
            <Label>Bắt đầu</Label>
            <Input
              type="date"
              value={f.startDate}
              onChange={(e) => setF({ ...f, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Kết thúc</Label>
            <Input
              type="date"
              value={f.endDate}
              onChange={(e) => setF({ ...f, endDate: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
