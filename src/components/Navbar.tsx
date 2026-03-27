import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { LiveStatusDot } from '@/components/LiveStatusDot';
import { LayoutDashboard, Code2, Brain, Zap, FileCode, Settings, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/synaptiforge-logo.png';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/editor', label: 'Editor', icon: Code2 },
  { to: '/signature', label: 'Signature', icon: Brain },
  { to: '/reflexes', label: 'Reflexes', icon: Zap },
  { to: '/patches', label: 'Patches', icon: FileCode },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user, sseConnected, setAuthenticated, setUser } = useAppStore();

  const handleLogout = () => {
    localStorage.removeItem('sf_guest');
    setAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Synaptiforge" width={28} height={28} className="rounded-lg" />
            <span className="font-display font-bold text-foreground text-base hidden sm:inline">Synaptiforge</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} className="relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: active ? 'hsl(252, 100%, 68%)' : undefined }}
                >
                  <span className={`flex items-center gap-1.5 ${active ? '' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-primary/8"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LiveStatusDot connected={sseConnected} />
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm font-medium text-foreground hidden sm:inline">{user?.name || 'Guest'}</span>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="flex md:hidden items-center gap-1 px-4 pb-2 overflow-x-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
