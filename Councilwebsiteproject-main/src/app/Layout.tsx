import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, FolderOpen, Menu, Briefcase, LogOut, User, Bell, Globe, FileText, Wrench, ChevronRight } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import { useAuth } from './context/AuthContext';
import { useAudit } from './context/AuditContext';
import { useNavigate } from 'react-router';
import logoImage from '../imports/Outlook-wehy2530_(2).jfif';

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getUnreadNotificationCount } = useAudit();
  const navigate = useNavigate();

  const unreadCount = getUnreadNotificationCount();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navigation = [
    { name: 'Dashboard',     path: '/',              icon: LayoutDashboard },
    { name: 'Portfolio',     path: '/portfolio',     icon: Briefcase },
    { name: 'Projects',      path: '/projects',      icon: FolderOpen },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Project Updates',path: '/project-updates',icon: Globe },
    { name: 'PM Toolkit',    path: '/toolkit',       icon: Wrench },
    { name: 'Audit Logs',    path: '/audit-logs',    icon: FileText, adminOnly: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col gap-1 ${mobile ? 'pt-4' : ''}`}>
      {navigation
        .filter(item => !item.adminOnly || user?.role === 'Administrator')
        .map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-150 group text-sm font-medium
                ${active
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
              style={active ? { backgroundColor: 'var(--council-blue)' } : {}}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {item.badge != null && item.badge > 0 && (
                  <Badge
                    className="text-white text-xs px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center"
                    style={{ backgroundColor: active ? 'rgba(255,255,255,0.3)' : 'var(--council-orange)' }}
                  >
                    {item.badge}
                  </Badge>
                )}
                {active && <ChevronRight className="w-3 h-3 text-white/70" />}
              </div>
            </Link>
          );
        })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(to right, var(--council-blue), var(--council-purple))` }} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-1 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <div
                    className="px-5 py-4 border-b"
                    style={{ background: `linear-gradient(135deg, var(--council-blue-light), var(--council-purple-light))` }}
                  >
                    <img src={logoImage} alt="Warren Shire Council" className="h-12 object-contain" />
                  </div>
                  <div className="px-3 py-3">
                    <NavLinks mobile />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 border-t p-3">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Link to="/">
                <img src={logoImage} alt="Warren Shire Council" className="h-11 object-contain" />
              </Link>
            </div>

            {/* Right: user info + logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs font-medium"
                  style={{ color: 'var(--council-purple)', borderColor: 'var(--council-purple)' }}
                >
                  {user?.role}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: 'var(--council-blue)' }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-700">{user?.name}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 gap-3">
            <nav className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sticky top-20">
              {/* Sidebar header */}
              <div className="px-3 pb-3 mb-1 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Navigation</p>
              </div>
              <NavLinks />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
