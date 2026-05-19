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
import { Plus, Trash2, Pencil, Store, MapPin, Package2 } from "lucide-react";
import type { Warehouse, WarehouseType } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/stores")({
  head: () => ({
    meta: [
      { title: "Quản lý cửa hàng — Xus Admin" },
      { name: "description", content: "Quản lý các kho/cửa hàng để soạn và giao hàng." },
    ],
  }),
  component: StoresPage,
});

function StoresPage() {
  const warehouses = useAppStore((s) => s.warehouses);
  const batches = useAppStore((s) => s.batches);
  const addWarehouse = useAppStore((s) => s.addWarehouse);
  const updateWarehouse = useAppStore((s) => s.updateWarehouse);
  const deleteWarehouse = useAppStore((s) => s.deleteWarehouse);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Warehouse | null>(null);
  const [form, setForm] = useState<Omit<Warehouse, "id">>({
    code: "",
    name: "",
    address: "",
    type: "normal",
    manager: "",
    active: true,
  });

  const openCreate = () => {
    setEdit(null);
    setForm({ code: "", name: "", address: "", type: "normal", manager: "", active: true });
    setOpen(true);
  };
  const openEdit = (w: Warehouse) => {
    setEdit(w);
    setForm(w);
    setOpen(true);
  };

  const submit = () => {
    if (!form.code || !form.name) {
      toast.error("Nhập mã & tên kho");
      return;
    }
    if (edit) {
      updateWarehouse(edit.id, form);
      toast.success("Đã cập nhật kho");
    } else {
      addWarehouse({ id: `wh-${Date.now()}`, ...form });
      toast.success(`Đã thêm kho ${form.name}`);
    }
    setOpen(false);
  };

  const stockOf = (id: string) =>
    batches.filter((b) => b && b.warehouseId === id).reduce((s, b) => s + (b ? b.quantity : 0), 0);

  return (
    <div>
      <PageHeader
        title="Quản lý cửa hàng / Kho"
        description="Tạo và quản lý các kho. Khi xác nhận đơn, nhân viên sẽ chọn kho để soạn & giao hàng."
        actions={
          <Button onClick={openCreate} className="gap-2 btn-glow text-primary-foreground">
            <Plus className="size-4" /> Thêm kho mới
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(warehouses || []).filter(Boolean).map((w) => (
          <Card key={w.id} className="p-5 card-3d">
            <div className="flex items-start gap-4">
              <div
                className="size-12 rounded-2xl flex items-center justify-center text-primary-foreground shadow-glow shrink-0"
                style={{ backgroundImage: "var(--gradient-primary-vivid)" }}
              >
                <Store className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{w.name}</h3>
                  <StatusBadge
                    label={w.type === "cold" ? "Kho mát" : "Kho thường"}
                    tone={w.type === "cold" ? "info" : "muted"}
                  />
                  {!w.active && <StatusBadge label="Tạm ngừng" tone="danger" />}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">{w.code}</div>
                <div className="text-sm mt-2 inline-flex items-start gap-1.5">
                  <MapPin className="size-3.5 mt-0.5 text-muted-foreground" />{" "}
                  <span>{w.address}</span>
                </div>
                <div className="text-sm mt-1 text-muted-foreground">
                  Quản lý: <span className="text-foreground font-medium">{w.manager}</span>
                </div>
                <div className="text-sm mt-1 inline-flex items-center gap-1.5">
                  <Package2 className="size-3.5 text-muted-foreground" /> Tồn:{" "}
                  <span className="font-semibold text-primary tabular-nums">{stockOf(w.id)}</span>{" "}
                  đơn vị
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <Switch
                  checked={w.active}
                  onCheckedChange={(v) => updateWarehouse(w.id, { active: v })}
                />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(w)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      deleteWarehouse(w.id);
                      toast.success("Đã xóa");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{edit ? "Sửa kho" : "Thêm kho mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mã kho</Label>
                <Input
                  value={form.code}
                  className="font-mono"
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="KHO-DN"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Loại</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as WarehouseType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Kho thường</SelectItem>
                    <SelectItem value="cold">Kho mát</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tên kho</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Địa chỉ</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Người quản lý</Label>
              <Input
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
              />
            </div>
            <Label className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />{" "}
              Đang hoạt động
            </Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submit} className="btn-glow text-primary-foreground">
              {edit ? "Lưu" : "Thêm kho"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
