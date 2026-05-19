import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ALL_PERMISSIONS } from "@/lib/mockData";
import { Plus, Shield, Users as UsersIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/permissions")({
  head: () => ({
    meta: [
      { title: "Phân quyền — Xus Admin" },
      { name: "description", content: "Quản lý vai trò, quyền và tài khoản hệ thống." },
    ],
  }),
  component: PermissionsPage,
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

function PermissionsPage() {
  const navigate = useNavigate();
  const roles = useAppStore((s) => s.roles);
  const users = useAppStore((s) => s.systemUsers);
  const togglePerm = useAppStore((s) => s.togglePermission);
  const deleteUser = useAppStore((s) => s.deleteUser);
  const updateUser = useAppStore((s) => s.updateUser);

  return (
    <div>
      <PageHeader
        title="Phân quyền & tài khoản"
        description="Cấu hình vai trò, quyền chi tiết và tài khoản người dùng nội bộ."
        actions={
          <Button
            onClick={() => navigate({ to: "/users/new" })}
            className="gap-2 btn-glow text-primary-foreground"
          >
            <Plus className="size-4" /> Tạo tài khoản
          </Button>
        }
      />

      <Tabs defaultValue="roles">
        <TabsList className="mb-4">
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="size-3.5" /> Vai trò & quyền
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <UsersIcon className="size-3.5" /> Tài khoản ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card key={role.key} className="p-5 card-3d">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="size-11 rounded-xl flex items-center justify-center text-primary-foreground shadow-glow shrink-0"
                    style={{ backgroundImage: "var(--gradient-primary-vivid)" }}
                  >
                    <Shield className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{role.name}</h3>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                    <div className="text-xs mt-1">
                      <span className="text-primary font-medium">{role.permissions.length}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {ALL_PERMISSIONS.length} quyền
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {PERM_GROUPS.map((g) => (
                    <div key={g.label}>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                        {g.label}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {g.perms.map((p) => {
                          const on = role.permissions.includes(p);
                          const disabled = role.key === "admin";
                          return (
                            <Label
                              key={p}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${on ? "bg-primary/10" : "bg-muted/40"} ${disabled ? "opacity-70" : "cursor-pointer hover:bg-primary/15"}`}
                            >
                              <Checkbox
                                checked={on}
                                disabled={disabled}
                                onCheckedChange={() => togglePerm(role.key, p)}
                              />
                              <span className="font-mono text-[10.5px]">{p}</span>
                            </Label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-0 overflow-hidden card-3d">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="text-left text-muted-foreground text-xs uppercase tracking-wider bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Họ tên</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">SĐT</th>
                    <th className="px-4 py-3 font-medium">Vai trò</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const role = roles.find((r) => r && r.key === u.role);
                    return (
                      <tr
                        key={u.id}
                        className="border-t border-border/60 hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                            {role?.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={u.active}
                            onCheckedChange={(v) => updateUser(u.id, { active: v })}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              deleteUser(u.id);
                              toast.success("Đã xóa tài khoản");
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
