import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';

/**
 * Layout wrapper for all public-facing pages.
 * Constrains content width for readability.
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--border-primary)] py-4 mt-auto">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            All financial records are public. Every transaction can be verified.
          </p>
        </div>
      </footer>
    </div>
  );
}
