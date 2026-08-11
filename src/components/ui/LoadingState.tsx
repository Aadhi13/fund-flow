import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
      <p className="text-sm text-[var(--text-tertiary)]">{message}</p>
    </div>
  );
}
