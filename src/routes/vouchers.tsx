import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Ticket, Edit } from "lucide-react";
import { formatDate, formatVND, formatNumber } from "@/lib/format";
import type { Voucher } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/vouchers")({
  head: () => ({
    meta: [
      { title: "Voucher — Xus Admin" },
      { name: "description", content: "Tạo và quản lý voucher khuyến mãi cho khách hàng." },
    ],
  }),
  component: VouchersPage,
});

function VouchersPage() {
  const vouchers = useAppStore((s) => s.vouchers);
  const addVoucher = useAppStore((s) => s.addVoucher);
  const toggle = useAppStore((s) => s.toggleVoucher);
  const remove = useAppStore((s) => s.deleteVoucher);

  const update = useAppStore((s) => (s as any).updateVoucher || (() => {}));

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Voucher, "id" | "used">>({
    code: "",
    name: "",
    type: "percent",
    value: 10,
    minOrder: 0,
    quota: 100,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    active: true,
  });

  const submit = () => {
    if (!form.code || !form.name || !form.endDate) {
      toast.error("Nhập đủ thông tin");
      return;
    }
    if (editId) {
      update(editId, form);
      toast.success("Cập nhật thành công");
    } else {
      addVoucher({ id: `v-${Date.now()}`, used: 0, ...form });
      toast.success(`Đã tạo voucher ${form.code}`);
    }
    setOpen(false);
    setEditId(null);
    setForm({ ...form, code: "", name: "", endDate: "" });
  };

  const openEdit = (v: Voucher) => {
    setForm({
      code: v.code,
      name: v.name,
      type: v.type,
      value: v.value,
      minOrder: v.minOrder,
      quota: v.quota,
      startDate: v.startDate,
      endDate: v.endDate,
      active: v.active,
    });
    setEditId(v.id);
    setOpen(true);
  };

  const valueLabel = (v: Voucher) =>
    v.type === "percent"
      ? `-${v.value}%`
      : v.type === "shipping"
        ? `Free ship`
        : `-${formatVND(v.value)}`;

  return (
    <div>
      <PageHeader
        title="Voucher"
        description="Tạo voucher giảm giá, miễn phí ship cho khách hàng Xus."
        actions={
          <Button onClick={() => setOpen(true)} className="gap-2 btn-glow text-primary-foreground">
            <Plus className="size-4" /> Tạo voucher
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(vouchers || []).filter(Boolean).map((v) => {
          const usedPct = v.quota > 0 ? Math.min(100, Math.round((v.used / v.quota) * 100)) : 0;
          return (
            <Card key={v.id} className="p-0 overflow-hidden card-3d relative">
              <div
                className="p-5 text-primary-foreground relative"
                style={{ backgroundImage: "var(--gradient-primary-vivid)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-80">
                      {v.type === "shipping"
                        ? "Free ship"
                        : v.type === "percent"
                          ? "Giảm %"
                          : "Giảm cố định"}
                    </div>
                    <div className="text-3xl font-bold mt-1 tabular-nums">{valueLabel(v)}</div>
                  </div>
                  <Ticket className="size-8 opacity-70" />
                </div>
                <div className="mt-3 px-2.5 py-1 rounded-md bg-white/20 inline-block backdrop-blur-sm">
                  <code className="text-sm font-mono font-bold">{v.code}</code>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="font-medium text-sm">{v.name}</div>
                <div className="text-xs text-muted-foreground">
                  Đơn tối thiểu {formatVND(v.minOrder)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(v.startDate)} → {formatDate(v.endDate)}
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Đã dùng</span>
                    <span className="font-medium tabular-nums">
                      {formatNumber(v.used)}/{formatNumber(v.quota)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Label className="flex items-center gap-2 text-xs">
                    <Switch checked={v.active} onCheckedChange={() => toggle(v.id)} />
                    {v.active ? (
                      <StatusBadge label="Đang chạy" tone="success" />
                    ) : (
                      <StatusBadge label="Tạm dừng" tone="muted" />
                    )}
                  </Label>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => openEdit(v)}
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        remove(v.id);
                        toast.success("Đã xóa");
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={(o) => {
        if (!o) {
          setOpen(false);
          setEditId(null);
          setForm({ ...form, code: "", name: "", endDate: "" });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Chỉnh sửa voucher" : "Tạo voucher mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mã voucher</Label>
                <Input
                  className="font-mono"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="XUS50K"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Loại</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as Voucher["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Giảm %</SelectItem>
                    <SelectItem value="fixed">Giảm số tiền</SelectItem>
                    <SelectItem value="shipping">Miễn phí ship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tên hiển thị</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Giá trị {form.type === "percent" ? "(%)" : "(đ)"}</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: +e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Đơn tối thiểu</Label>
                <Input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: +e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Số lượng phát hành</Label>
              <Input
                type="number"
                value={form.quota}
                onChange={(e) => setForm({ ...form, quota: +e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bắt đầu</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kết thúc</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submit} className="btn-glow text-primary-foreground">
              {editId ? "Lưu thay đổi" : "Tạo voucher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
