import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-2xl bg-accent-50 dark:bg-accent-950/40 text-accent-600 dark:text-accent-400 flex items-center justify-center mx-auto border border-accent-200 dark:border-accent-800/40 shadow-sm">
            <FileQuestion size={40} />
          </div>
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-expense-600 text-white rounded-full">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
            The requested page or financial record could not be found. It may have been moved, renamed, or restricted.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" icon={<Home size={15} />}>
              Public Ledger
            </Button>
          </Link>

          {user && (
            <Link to="/admin">
              <Button variant="secondary" icon={<LayoutDashboard size={15} />}>
                Admin Dashboard
              </Button>
            </Link>
          )}

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>

        <div className="pt-6 border-t border-[var(--border-primary)] text-[11px] text-[var(--text-tertiary)] font-mono">
          FundFlow Transparency System · Error 404
        </div>
      </div>
    </div>
  );
}
