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
import type { WarehouseType } from "@/lib/mockData";

export const Route = createFileRoute("/stores/new")({
  head: () => ({ meta: [{ title: "Tạo cửa hàng/kho — Xus Admin" }] }),
  component: StoresNewPage,
});

function StoresNewPage() {
  const nav = useNavigate();
  const addWarehouse = useAppStore((s) => s.addWarehouse);
  const [f, setF] = useState({
    code: "",
    name: "",
    address: "",
    type: "normal" as WarehouseType,
    manager: "",
  });

  const submit = () => {
    if (!f.code || !f.name) {
      toast.error("Nhập mã & tên kho");
      return;
    }
    addWarehouse({ id: `wh-${Date.now()}`, ...f, active: true });
    toast.success("Đã tạo kho/cửa hàng");
    nav({ to: "/stores" });
  };

  return (
    <div>
      <PageHeader
        title="Tạo cửa hàng / kho mới"
        actions={
          <>
            <Link to="/stores" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>
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
            <Label>Mã *</Label>
            <Input
              value={f.code}
              onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })}
              placeholder="KHO-DN"
            />
          </div>
          <div>
            <Label>Tên *</Label>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Địa chỉ</Label>
            <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
          </div>
          <div>
            <Label>Loại</Label>
            <Select value={f.type} onValueChange={(v: WarehouseType) => setF({ ...f, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold">Kho lạnh</SelectItem>
                <SelectItem value="normal">Kho thường</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quản lý kho</Label>
            <Input value={f.manager} onChange={(e) => setF({ ...f, manager: e.target.value })} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
