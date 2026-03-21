'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';
import {
  LayoutDashboard,
  GraduationCap,
  BookUser,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  CreditCard,
  LogOut,
  Menu,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Alumnos', icon: GraduationCap },
  { href: '/teachers', label: 'Maestros', icon: BookUser },
  { href: '/subjects', label: 'Materias', icon: BookOpen },
  { href: '/grades', label: 'Calificaciones', icon: ClipboardList },
  { href: '/attendance', label: 'Asistencias', icon: CalendarCheck },
  { href: '/payments', label: 'Pagos', icon: CreditCard },
];

function NavLink({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: (typeof navItems)[0];
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        collapsed ? 'justify-center px-2' : '',
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && item.label}
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function getAvatarUrl(fotoUrl: string | null | undefined): string | undefined {
  if (!fotoUrl) return undefined;
  if (fotoUrl.startsWith('http')) return fotoUrl;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api').replace('/api', '');
  return `${base}${fotoUrl}`;
}

function SidebarContent({
  pathname,
  user,
  collapsed,
  onToggleCollapse,
  onNav,
  onLogout,
}: {
  pathname: string;
  user: any;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNav?: () => void;
  onLogout: () => void;
}) {
  const initials = user?.nombre
    ? user.nombre
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const avatarUrl = getAvatarUrl(user?.foto_url);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header / Logo */}
      <div className={cn('flex h-14 items-center border-b border-sidebar-border', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
              <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-none truncate">EduCore ERP</p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Sistema Escolar</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary">
            <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
            collapsed={!!collapsed}
            onClick={onNav}
          />
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User section */}
      <div className={cn('p-3 space-y-1', collapsed && 'flex flex-col items-center')}>
        {/* Profile link */}
        <Link
          href="/profile"
          onClick={onNav}
          title={collapsed ? 'Mi perfil' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed ? 'justify-center px-2 w-full' : '',
            pathname === '/profile' ? 'bg-sidebar-accent' : ''
          )}
        >
          <Avatar className="h-7 w-7 shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user?.nombre} />}
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate leading-none">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user?.role}</p>
            </div>
          )}
        </Link>

        <Button
          variant="ghost"
          size="sm"
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={cn(
            'w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            collapsed ? 'justify-center px-2' : 'justify-start gap-2'
          )}
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Cerrar sesión'}
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(authService.getUser());
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, [router]);

  // Refresh user from localStorage when navigating (profile updates)
  useEffect(() => {
    const u = authService.getUser();
    if (u) setUser(u);
  }, [pathname]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  };

  const logout = () => {
    authService.logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const currentLabel =
    pathname === '/profile'
      ? 'Mi Perfil'
      : (navItems.find((n) => pathname.startsWith(n.href))?.label ?? 'Dashboard');

  const sidebarWidth = collapsed ? 'lg:w-14' : 'lg:w-60';
  const mainPadding = collapsed ? 'lg:pl-14' : 'lg:pl-60';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-sidebar-border transition-all duration-200',
          sidebarWidth
        )}
      >
        <SidebarContent
          pathname={pathname}
          user={user}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onLogout={logout}
        />
      </aside>

      {/* Main area */}
      <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-200', mainPadding)}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 md:px-6">
          {/* Mobile menu */}
          <Sheet open={sheetOpen} onOpenChange={(o) => setSheetOpen(o)}>
            <SheetTrigger
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent hover:bg-muted transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60">
              <SidebarContent
                pathname={pathname}
                user={user}
                collapsed={false}
                onNav={() => setSheetOpen(false)}
                onLogout={logout}
              />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground">{currentLabel}</h1>
          </div>

          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
