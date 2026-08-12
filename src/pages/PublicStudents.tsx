import { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useStudents } from '../hooks/useStudents';
import { Users, IndianRupee } from 'lucide-react';
import type { StudentStatus } from '../types';

export function PublicStudents() {
  const { students, summary, loading, error, refetch } = useStudents();

  const activeStudents = useMemo(() => students.filter(s => s.status !== 'inactive'), [students]);

  const formatCurrency = (val: number) => '₹' + val.toLocaleString('en-IN');

  const getStatusBadge = (status: StudentStatus) => {
    switch(status) {
      case 'paid': return <Badge variant="income">PAID</Badge>;
      case 'partial': return <Badge variant="warning">PARTIAL</Badge>;
      case 'not_paid': return <Badge variant="expense">NOT PAID</Badge>;
      case 'overpaid': return <Badge variant="income">OVERPAID</Badge>;
      default: return null;
    }
  };

  const progressPercent = summary.total_expected > 0 
    ? Math.min(100, Math.round((summary.total_collected / summary.total_expected) * 100))
    : summary.total_collected > 0 ? 100 : 0;

  if (loading) return <LoadingState message="Loading student contributions…" />;
  if (error) return <ErrorState title="Failed to load contributions" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Contributions"
        description="Public view of expected and paid contributions."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm" className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <Users size={14} /> Total Students
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)]">{summary.total_students}</div>
          <div className="text-[10px] text-[var(--text-tertiary)] flex gap-2">
            <span className="text-income-600 font-medium">{summary.paid} Paid</span>
            <span className="text-expense-600 font-medium">{summary.not_paid} Unpaid</span>
          </div>
        </Card>
        
        <Card padding="sm" className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <IndianRupee size={14} /> Expected
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(summary.total_expected)}</div>
        </Card>

        <Card padding="sm" className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <IndianRupee size={14} /> Collected
          </div>
          <div className="text-xl font-bold text-income-600">{formatCurrency(summary.total_collected)}</div>
        </Card>

        <Card padding="sm" className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <IndianRupee size={14} /> Remaining
          </div>
          <div className="text-xl font-bold text-warning-600">{formatCurrency(summary.total_remaining)}</div>
        </Card>
      </div>

      <Card padding="sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Overall Progress</span>
          <span className="text-sm font-bold text-income-600">{progressPercent}% Collected</span>
        </div>
        <div className="w-full h-2.5 bg-[var(--surface-tertiary)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-income-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {activeStudents.length === 0 ? (
          <div className="col-span-full py-8 text-center text-[var(--text-tertiary)]">
            No students found.
          </div>
        ) : (
          activeStudents.map(student => {
            const remaining = Math.max(0, student.expected_amount - student.paid_amount);
            const progress = student.expected_amount > 0 
              ? Math.min(100, Math.round((student.paid_amount / student.expected_amount) * 100))
              : student.paid_amount > 0 ? 100 : 0;

            return (
              <Card key={student.id} padding="sm" className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-[var(--text-primary)]">{student.name}</h3>
                  {getStatusBadge(student.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-[var(--border-primary)]">
                  <div>
                    <span className="block text-xs text-[var(--text-tertiary)]">Expected</span>
                    <span className="font-medium">{formatCurrency(student.expected_amount)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-[var(--text-tertiary)]">Paid</span>
                    <span className="font-medium text-income-600">{formatCurrency(student.paid_amount)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[11px] text-[var(--text-tertiary)] flex justify-between">
                      <span>Remaining: {formatCurrency(remaining)}</span>
                      <span>{progress}%</span>
                    </span>
                    <div className="w-full h-1.5 bg-[var(--surface-tertiary)] rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${student.status === 'not_paid' ? 'bg-expense-500' : 'bg-income-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
