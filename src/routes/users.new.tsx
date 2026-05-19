import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ALL_PERMISSIONS, type SystemUser, type RoleKey } from "@/lib/mockData";
import {
  ArrowLeft,
  Save,
  UserPlus,
  Shield,
  Mail,
  Phone,
  User as UserIcon,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/users/new")({
  head: () => ({ meta: [{ title: "Tạo tài khoản — Xus Admin" }] }),
  component: NewUserPage,
});

const PERM_GROUPS: { label: string; perms: string[] }[] = [
  { label: "Tổng quan", perms: ["dashboard.view", "report.view"] },
  { label: "Sản phẩm", perms: ["products.view", "products.manage"] },
  { label: "Kho", perms: ["inventory.view", "inventory.manage", "warehouse.manage"] },
  {
    label: "Đơn hàng",
    perms: ["orders.view", "orders.confirm", "orders.handover", "orders.complete"],
  },
  {
    label: "Marketing",
    perms: ["marketing.manage", "voucher.manage", "banner.manage", "post.manage"],
  },
  { label: "Hệ thống", perms: ["customers.view", "user.manage"] },
];

function NewUserPage() {
  const navigate = useNavigate();
  const roles = useAppStore((s) => s.roles);
  const warehouses = useAppStore((s) => s.warehouses);
  const addUser = useAppStore((s) => s.addUser);

  const [form, setForm] = useState<Omit<SystemUser, "id" | "createdAt">>({
    name: "",
    email: "",
    phone: "",
    role: "warehouse_staff",
    active: true,
  });
  const [password, setPassword] = useState("");
  const [allowedWh, setAllowedWh] = useState<string[]>([]);
  const [extraPerms, setExtraPerms] = useState<string[]>([]);

  const role = roles.find((r) => r && r.key === form.role);
  const effectivePerms = new Set([...(role?.permissions ?? []), ...extraPerms]);

  const submit = () => {
    if (!form.name || !form.email) return toast.error("Nhập tên và email");
    if (password.length < 6) return toast.error("Mật khẩu tối thiểu 6 ký tự");
    const u: SystemUser = {
      id: `u-${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addUser(u);
    toast.success(`Đã tạo tài khoản ${u.name}`);
    navigate({ to: "/permissions" });
  };

  const toggleWh = (id: string) =>
    setAllowedWh((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const togglePerm = (p: string) =>
    setExtraPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/permissions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Quay lại Phân quyền
        </Link>
      </div>
      <PageHeader
        title="Tạo tài khoản mới"
        description="Thiết lập thông tin, vai trò, kho được phép và quyền chi tiết cho người dùng."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/permissions" })}>
              Hủy
            </Button>
            <Button onClick={submit} className="btn-glow text-white gap-2">
              <Save className="size-4" /> Tạo tài khoản
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 card-3d lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            <h3 className="font-semibold">Thông tin cơ bản</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Họ và tên *</Label>
              <div className="relative mt-1.5">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="pl-9 h-11"
                />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-9 h-11"
                />
              </div>
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="pl-9 h-11"
                />
              </div>
            </div>
            <div>
              <Label>Mật khẩu khởi tạo *</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="pl-9 h-11"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60">
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
            <div>
              <div className="text-sm font-medium">Kích hoạt ngay</div>
              <div className="text-xs text-muted-foreground">
                Người dùng có thể đăng nhập sau khi tạo
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="size-5 text-primary" />
              <h3 className="font-semibold">Vai trò chính</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(roles || []).filter(Boolean).map((r) => (
                <label
                  key={r.key}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    form.role === r.key
                      ? "border-primary bg-primary/5 shadow-glow"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={form.role === r.key}
                    onChange={() => setForm({ ...form, role: r.key as RoleKey })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.description}</div>
                    <div className="text-[10px] text-primary mt-0.5">
                      {r.permissions.length} quyền
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Kho được phép truy cập</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(warehouses || []).filter(Boolean).map((w) => (
                <Label
                  key={w.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer hover:bg-muted/40"
                >
                  <Checkbox
                    checked={allowedWh.includes(w.id)}
                    onCheckedChange={() => toggleWh(w.id)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{w.name}</div>
                    <div className="text-xs text-muted-foreground">{w.address}</div>
                  </div>
                </Label>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6 card-3d space-y-4 h-fit">
          <h3 className="font-semibold">Quyền chi tiết</h3>
          <p className="text-xs text-muted-foreground">
            Quyền của vai trò + quyền bổ sung riêng cho người dùng.
          </p>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {(PERM_GROUPS || []).filter(Boolean).map((g) => (
              <div key={g.label}>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                  {g.label}
                </div>
                <div className="space-y-1">
                  {(g.perms || []).filter(Boolean).map((p) => {
                    const fromRole = role?.permissions.includes(p);
                    const checked = effectivePerms.has(p);
                    return (
                      <Label
                        key={p}
                        className={`flex items-center gap-2 p-2 rounded-md text-xs cursor-pointer ${checked ? "bg-primary/10" : "bg-muted/40"}`}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={fromRole}
                          onCheckedChange={() => !fromRole && togglePerm(p)}
                        />
                        <span className="font-mono flex-1">{p}</span>
                        {fromRole && <span className="text-[9px] text-primary">vai trò</span>}
                      </Label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs p-2.5 rounded-lg bg-info/10 text-info-foreground">
            Tổng:{" "}
            <strong>
              {effectivePerms.size} / {ALL_PERMISSIONS.length}
            </strong>{" "}
            quyền hiệu lực
          </div>
        </Card>
      </div>
    </div>
  );
}
