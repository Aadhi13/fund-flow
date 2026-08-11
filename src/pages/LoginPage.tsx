import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to admin
  const from = (location.state as { from?: string })?.from || '/admin';
  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg font-bold">₹</span>
          </div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Organizer Login
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Sign in to manage event finances
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-expense-600 bg-expense-50 dark:bg-expense-700/20 px-3 py-2 rounded">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              icon={<LogIn size={16} />}
            >
              Sign in
            </Button>
          </form>
        </Card>

        <p className="text-xs text-[var(--text-tertiary)] text-center mt-4">
          <Link to="/" className="hover:text-[var(--text-secondary)] underline">
            ← Back to public dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
