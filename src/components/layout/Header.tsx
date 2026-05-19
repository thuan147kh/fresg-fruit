import { Bell, Search, Menu, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/useAppStore";
import { useAuth, ROLE_LABELS } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const orders = useAppStore((s) => s.orders);
  const { profile, user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const pendingCount = (orders || []).filter((o) => o && o.status === "pending").length;

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const primaryRole = roles[0];

  const handleLogout = async () => {
    await signOut();
    toast.success("Đã đăng xuất");
    navigate({ to: "/auth", search: { redirect: "/", mode: "login" } });
  };

  return (
    <header className="sticky top-0 z-20 h-16 glass border-b border-border flex items-center px-4 lg:px-6 gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted-foreground"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-secondary/60 border border-transparent text-sm focus:bg-card focus:border-border focus:ring-2 focus:ring-ring/30 outline-none transition shadow-inner-soft"
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center shadow-glow">
                  {pendingCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-0.5">
              <span className="font-medium">{pendingCount} đơn hàng chờ xác nhận</span>
              <span className="text-xs text-muted-foreground">Vui lòng xử lý sớm</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-0.5">
              <span className="font-medium">2 sản phẩm sắp hết hạn</span>
              <span className="text-xs text-muted-foreground">Cần kiểm tra kho</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-secondary transition">
              <Avatar className="size-8 shadow-glow">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
                <AvatarFallback
                  className="text-primary-foreground text-sm font-semibold"
                  style={{ backgroundImage: "var(--gradient-primary-vivid)" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-sm font-semibold">{displayName}</div>
                <div className="text-[11px] text-muted-foreground">
                  {primaryRole ? ROLE_LABELS[primaryRole] : "Người dùng"}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span>{displayName}</span>
              <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <User className="size-4 mr-2" /> Hồ sơ cá nhân
              </Link>
            </DropdownMenuItem>
            {/* Settings hidden per requirements */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="size-4 mr-2" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
