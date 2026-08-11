import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/transactions', icon: ArrowLeftRight, label: 'Transactions', end: false },
];

function NavItem({
  to,
  icon: Icon,
  label,
  end,
  onClick,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  end: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors duration-100',
          isActive
            ? 'bg-accent-50 text-accent-700 font-medium dark:bg-accent-700/20 dark:text-accent-500'
            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]',
        )
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

/**
 * Admin layout with sidebar on desktop, slide-out nav on mobile.
 */
export function AdminLayout() {
  const { theme, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:shrink-0 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
        <div className="h-12 flex items-center px-4 border-b border-[var(--sidebar-border)]">
          <Link to="/admin" className="flex items-center gap-2 text-[var(--text-primary)] no-underline">
            <div className="w-6 h-6 bg-accent-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">₹</span>
            </div>
            <span className="text-sm font-semibold">FundFlow</span>
            <span className="text-xs text-[var(--text-tertiary)] ml-1">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--sidebar-border)] space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ExternalLink size={16} />
            Public view
          </Link>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md w-full text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <button
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md w-full text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 bg-[var(--header-bg)] border-b border-[var(--header-border)]">
        <div className="h-12 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-1.5 -ml-1.5 rounded text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold text-[var(--text-primary)]">FundFlow</span>
            <span className="text-xs text-[var(--text-tertiary)]">Admin</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeMobileNav}
          />
          <nav className="absolute left-0 top-0 bottom-0 w-64 bg-[var(--surface-primary)] border-r border-[var(--border-primary)] flex flex-col">
            <div className="h-12 flex items-center justify-between px-4 border-b border-[var(--border-primary)]">
              <span className="text-sm font-semibold">Navigation</span>
              <button
                onClick={closeMobileNav}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-3 flex flex-col gap-0.5">
              {NAV_ITEMS.map(item => (
                <NavItem key={item.to} {...item} onClick={closeMobileNav} />
              ))}
            </div>
            <div className="p-3 border-t border-[var(--border-primary)] space-y-1">
              <Link
                to="/"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ExternalLink size={16} />
                Public view
              </Link>
              <button
                className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md w-full text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
