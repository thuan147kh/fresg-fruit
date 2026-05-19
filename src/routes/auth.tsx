import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Leaf,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import heroImg from "@/assets/login-hero.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — Xus Admin" },
      { name: "description", content: "Đăng nhập hệ thống quản trị Xus." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/",
    mode: typeof s.mode === "string" ? s.mode : "login",
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(
    search.mode === "signup" ? "signup" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: search.redirect || "/" });
    }
  }, [session, loading, navigate, search.redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Đăng nhập thành công");
      } else {
        const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/` : "/";
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Tạo tài khoản thành công! Đang đăng nhập...");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      if (msg.includes("Invalid login")) toast.error("Email hoặc mật khẩu không đúng");
      else if (msg.includes("already registered") || msg.includes("already been registered"))
        toast.error("Email đã được đăng ký, hãy đăng nhập");
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left: Brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ backgroundImage: "var(--gradient-primary-vivid)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(at 30% 30%, oklch(1 0 0 / 0.3), transparent 60%)" }}
        />
        <div className="absolute -top-20 -right-20 size-96 rounded-full bg-white/10 blur-3xl animate-float-slow" />
        <div
          className="absolute bottom-10 -left-10 size-80 rounded-full bg-white/10 blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl glass flex items-center justify-center shadow-glow-lg">
              <Leaf className="size-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">Xus</div>
              <div className="text-xs text-white/80">Sàn TMĐT nông sản tươi sạch</div>
            </div>
          </div>

          <div className="space-y-6">
            <img
              src={heroImg}
              alt="Fresh produce"
              width={1024}
              height={1280}
              className="w-full max-w-md mx-auto drop-shadow-2xl animate-float-slow rounded-3xl"
            />
            <div className="space-y-3">
              <h1 className="text-4xl font-bold leading-tight">
                Quản lý toàn diện
                <br />
                sàn nông sản hiện đại
              </h1>
              <p className="text-white/85 max-w-md">
                Từ kho theo lô, đơn hàng đa kênh, đến marketing, B2B và báo cáo — tất cả trong một
                dashboard.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: ShieldCheck, label: "Bảo mật RLS" },
              { icon: Zap, label: "Real-time sync" },
              { icon: Sparkles, label: "UI 3D hiện đại" },
            ].map((f) => (
              <div key={f.label} className="glass rounded-xl p-3 text-center">
                <f.icon className="size-5 mx-auto mb-1.5 text-white" />
                <div className="text-xs font-medium">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div
          className="absolute inset-0 -z-10"
          style={{ backgroundImage: "var(--gradient-mesh)" }}
        />
        <Card className="w-full max-w-md p-8 shadow-xl card-3d animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div
              className="size-10 rounded-xl flex items-center justify-center text-white shadow-glow"
              style={{ backgroundImage: "var(--gradient-primary-vivid)" }}
            >
              <Leaf className="size-5" />
            </div>
            <span className="text-xl font-bold">Xus Admin</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Đăng nhập để vào hệ thống quản trị Xus"
                : "Tài khoản đầu tiên sẽ tự động là Quản trị viên"}
            </p>
          </div>

          <div className="flex gap-1 p-1 bg-secondary/60 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                mode === "login"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <div className="relative mt-1.5">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="pl-9 h-11"
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@xus.vn"
                  required
                  autoComplete="email"
                  className="pl-9 h-11"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-primary hover:underline">
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 btn-glow text-white font-semibold"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                  <ArrowRight className="size-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Bằng việc tiếp tục, bạn đồng ý với{" "}
            <Link to="/" className="text-primary hover:underline">
              Điều khoản
            </Link>{" "}
            và{" "}
            <Link to="/" className="text-primary hover:underline">
              Chính sách
            </Link>{" "}
            của Xus.
          </p>
        </Card>
      </div>
    </div>
  );
}
