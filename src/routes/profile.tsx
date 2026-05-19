import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth, ROLE_LABELS, ROLE_COLORS } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Save, Lock, Mail, Phone, User as UserIcon, Shield, Camera, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadImage } from "@/lib/supabaseApi";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Hồ sơ cá nhân — Xus Admin" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, roles, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  const initials = (fullName || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAvatarUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(files[0], "avatars");
      setAvatarUrl(url);
      toast.success("Đã tải ảnh đại diện");
    } catch {
      toast.error("Lỗi khi tải ảnh");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, avatar_url: avatarUrl })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Đã cập nhật hồ sơ");
    await refreshProfile();
  };

  const handleChangePwd = async () => {
    if (pwd.length < 6) return toast.error("Mật khẩu tối thiểu 6 ký tự");
    if (pwd !== pwd2) return toast.error("Mật khẩu xác nhận không khớp");
    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setChangingPwd(false);
    if (error) return toast.error(error.message);
    toast.success("Đã đổi mật khẩu");
    setPwd("");
    setPwd2("");
  };

  return (
    <div>
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Thông tin tài khoản, vai trò và bảo mật của bạn."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 card-3d lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="size-24 shadow-glow-lg">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                <AvatarFallback
                  className="text-2xl text-white font-bold"
                  style={{ backgroundImage: "var(--gradient-primary-vivid)" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition cursor-pointer">
                {uploadingAvatar ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e.target.files)}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <h2 className="mt-4 font-bold text-lg">{fullName || "Chưa cập nhật"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {roles.map((r) => (
                <span
                  key={r}
                  className="px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                  style={{ background: ROLE_COLORS[r] }}
                >
                  {ROLE_LABELS[r]}
                </span>
              ))}
            </div>

            <div className="mt-6 w-full pt-6 border-t border-border space-y-2 text-sm text-left">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="size-4 text-primary" />
                <span>
                  Trạng thái: <span className="text-success font-medium">Hoạt động</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="size-4 text-primary" />
                <span className="truncate">ID: {user?.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 card-3d lg:col-span-2">
          <Tabs defaultValue="info">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="security">Bảo mật</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div>
                <Label>Họ và tên</Label>
                <div className="relative mt-1.5">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="pl-9 h-11"
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input value={user?.email ?? ""} disabled className="pl-9 h-11" />
                </div>
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="pl-9 h-11"
                  />
                </div>
              </div>
              <div>
                <Label>Ảnh đại diện</Label>
                <div className="mt-1.5 flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-primary transition">
                    <Upload className="size-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {avatarUrl ? "Đã có ảnh — click để thay đổi" : "Tải ảnh lên"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarUpload(e.target.files)}
                    />
                  </label>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="btn-glow text-white">
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Save className="size-4 mr-1.5" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 text-sm">
                <strong>Lưu ý:</strong> Mật khẩu phải có ít nhất 6 ký tự. Sau khi đổi, bạn vẫn duy
                trì phiên đăng nhập hiện tại.
              </div>
              <div>
                <Label>Mật khẩu mới</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    minLength={6}
                    className="pl-9 h-11"
                  />
                </div>
              </div>
              <div>
                <Label>Xác nhận mật khẩu mới</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={pwd2}
                    onChange={(e) => setPwd2(e.target.value)}
                    minLength={6}
                    className="pl-9 h-11"
                  />
                </div>
              </div>
              <Button
                onClick={handleChangePwd}
                disabled={changingPwd || !pwd}
                className="btn-glow text-white"
              >
                {changingPwd ? <Loader2 className="size-4 animate-spin" /> : "Đổi mật khẩu"}
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
