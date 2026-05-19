import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Globe, Palette, Shield, Database, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Cài đặt — Xus Admin" }] }),
  component: SettingsPage,
});

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
const sections: Section[] = [
  { id: "general", label: "Tổng quát", icon: Globe },
  { id: "appearance", label: "Giao diện", icon: Palette },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "security", label: "Bảo mật", icon: Shield },
  { id: "data", label: "Dữ liệu", icon: Database },
  { id: "email", label: "Email", icon: Mail },
];

function SettingsPage() {
  const [active, setActive] = useState("general");
  const [companyName, setCompanyName] = useState("Xus Mart");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);

  const save = () => toast.success("Đã lưu cài đặt");

  return (
    <div>
      <PageHeader
        title="Cài đặt hệ thống"
        description="Cấu hình các thông số chung của hệ thống Xus."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-3 card-3d h-fit">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active === s.id
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <s.icon className="size-4" /> {s.label}
              </button>
            ))}
          </nav>
        </Card>

        <Card className="p-6 card-3d lg:col-span-3">
          {active === "general" && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold">Thông tin doanh nghiệp</h3>
              <div>
                <Label>Tên cửa hàng</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label>Mã số thuế</Label>
                <Input placeholder="0314XXXXXX" className="mt-1.5 h-11" />
              </div>
              <div>
                <Label>Địa chỉ trụ sở</Label>
                <Input placeholder="123 Lê Lợi, Q.1, TP.HCM" className="mt-1.5 h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hotline</Label>
                  <Input placeholder="1900 1234" className="mt-1.5 h-11" />
                </div>
                <div>
                  <Label>Email hỗ trợ</Label>
                  <Input placeholder="support@xus.vn" className="mt-1.5 h-11" />
                </div>
              </div>
              <Button onClick={save} className="btn-glow text-white">
                Lưu thay đổi
              </Button>
            </div>
          )}

          {active === "appearance" && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold">Giao diện</h3>
              <SettingRow label="Chế độ tối" desc="Bật giao diện tối cho mắt dễ chịu vào ban đêm.">
                <Switch />
              </SettingRow>
              <SettingRow label="Hiệu ứng 3D" desc="Bật các hiệu ứng card-3d, glow, parallax.">
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow label="Sidebar thu gọn mặc định" desc="Mở app với sidebar thu gọn.">
                <Switch />
              </SettingRow>
              <SettingRow
                label="Hiển thị mật độ cao"
                desc="Giảm khoảng cách padding để hiển thị nhiều dữ liệu."
              >
                <Switch />
              </SettingRow>
            </div>
          )}

          {active === "notifications" && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold">Thông báo</h3>
              <SettingRow label="Email thông báo" desc="Gửi email khi có sự kiện quan trọng.">
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </SettingRow>
              <SettingRow
                label="Thông báo đẩy (Push)"
                desc="Hiển thị notification trên trình duyệt."
              >
                <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
              </SettingRow>
              <SettingRow label="Cảnh báo đơn hàng mới" desc="Thông báo khi có đơn cần xử lý.">
                <Switch checked={orderAlerts} onCheckedChange={setOrderAlerts} />
              </SettingRow>
              <SettingRow
                label="Cảnh báo tồn kho"
                desc="Thông báo khi sản phẩm sắp hết hoặc sắp hết hạn."
              >
                <Switch checked={stockAlerts} onCheckedChange={setStockAlerts} />
              </SettingRow>
              <Button onClick={save} className="btn-glow text-white">
                Lưu cài đặt
              </Button>
            </div>
          )}

          {active === "security" && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold">Bảo mật</h3>
              <SettingRow
                label="Xác thực 2 lớp (2FA)"
                desc="Bật xác thực 2 yếu tố cho tài khoản admin."
              >
                <Switch />
              </SettingRow>
              <SettingRow label="Tự động đăng xuất" desc="Đăng xuất sau 30 phút không hoạt động.">
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow
                label="Yêu cầu mật khẩu mạnh"
                desc="Tối thiểu 12 ký tự, có chữ hoa, số, ký tự đặc biệt."
              >
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow label="Ghi log hoạt động" desc="Lưu lịch sử các thao tác quan trọng.">
                <Switch defaultChecked />
              </SettingRow>
            </div>
          )}

          {active === "data" && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold">Dữ liệu & Sao lưu</h3>
              <p className="text-sm text-muted-foreground">
                Quản lý dữ liệu hệ thống và xuất báo cáo.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline">Xuất tất cả dữ liệu (CSV)</Button>
                <Button variant="outline">Sao lưu thủ công</Button>
                <Button variant="outline">Lịch sử sao lưu</Button>
                <Button variant="destructive">Xóa dữ liệu cũ (&gt;1 năm)</Button>
              </div>
            </div>
          )}

          {active === "email" && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold">Cấu hình Email</h3>
              <div>
                <Label>SMTP Host</Label>
                <Input placeholder="smtp.gmail.com" className="mt-1.5 h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cổng (Port)</Label>
                  <Input placeholder="587" className="mt-1.5 h-11" />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input placeholder="noreply@xus.vn" className="mt-1.5 h-11" />
                </div>
              </div>
              <Button onClick={save} className="btn-glow text-white">
                Lưu cấu hình
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  desc,
  children,
}: {
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      {children}
    </div>
  );
}
