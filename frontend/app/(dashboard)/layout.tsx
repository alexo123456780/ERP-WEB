'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../services/auth.service';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/students', label: 'Alumnos', icon: '🎓' },
  { href: '/teachers', label: 'Maestros', icon: '👨‍🏫' },
  { href: '/subjects', label: 'Materias', icon: '📚' },
  { href: '/grades', label: 'Calificaciones', icon: '📝' },
  { href: '/attendance', label: 'Asistencias', icon: '✅' },
  { href: '/payments', label: 'Pagos', icon: '💰' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(authService.getUser());
  }, [router]);

  const logout = () => {
    authService.logout();
    router.push('/login');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 text-white flex flex-col transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-xl font-bold">EduCore ERP</h1>
          <p className="text-blue-300 text-xs mt-1">Sistema Escolar</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-100 hover:bg-blue-700'}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-700">
          <div className="text-sm text-blue-200 mb-2">{user.nombre}</div>
          <div className="text-xs text-blue-400 mb-3 capitalize">{user.role}</div>
          <button
            onClick={logout}
            className="w-full text-sm bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-800"
          >
            ☰
          </button>
          <span className="text-gray-800 font-medium text-sm capitalize">
            {navItems.find((n) => pathname.startsWith(n.href))?.label ?? 'Dashboard'}
          </span>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
