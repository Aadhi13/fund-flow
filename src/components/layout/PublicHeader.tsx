import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Shield } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

/**
 * Public site header.
 * Compact, informational — not a marketing hero.
 */
export function PublicHeader() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-[var(--header-bg)] border-b border-[var(--header-border)]">
      <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[var(--text-primary)] no-underline">
          <div className="w-6 h-6 bg-accent-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">₹</span>
          </div>
          <span className="text-sm font-semibold">FundFlow</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/students"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-md hover:bg-[var(--surface-tertiary)] transition-colors"
          >
            Contributions
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {!location.pathname.startsWith('/admin') && (
            <Link
              to="/login"
              className="p-2 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors"
              aria-label="Organizer login"
            >
              <Shield size={16} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
