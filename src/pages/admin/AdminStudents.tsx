import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Ban,
  CheckCircle2,
  Users,
  IndianRupee,
  MoreVertical,
  Banknote
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useStudents } from '../../hooks/useStudents';
import { updateStudent } from '../../data/students';
import { StudentFormModal } from '../../components/students/StudentFormModal';
import { BulkAddStudentModal } from '../../components/students/BulkAddStudentModal';
import { UpdatePaymentModal } from '../../components/students/UpdatePaymentModal';
import type { Student, StudentStatus } from '../../types';

type FilterStatus = 'all' | StudentStatus;
type SortOption = 'name' | 'remaining_desc' | 'remaining_asc' | 'status';

export function AdminStudents() {
  const { students, summary, loading, error, refetch } = useStudents();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name');

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Feedback banner state
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        if (filterStatus !== 'all' && s.status !== filterStatus) return false;
        // Default hide inactive unless explicitly requested
        if (filterStatus !== 'inactive' && filterStatus === 'all' && s.status === 'inactive') return false;
        if (searchQuery) {
          return s.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'name') return a.name.localeCompare(b.name);
        if (sortOption === 'remaining_desc') {
          return (b.expected_amount - b.paid_amount) - (a.expected_amount - a.paid_amount);
        }
        if (sortOption === 'remaining_asc') {
          return (a.expected_amount - a.paid_amount) - (b.expected_amount - b.paid_amount);
        }
        if (sortOption === 'status') {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [students, filterStatus, searchQuery, sortOption]);

  const handleDeactivate = async (student: Student) => {
    try {
      await updateStudent(student.id, { status: 'inactive' });
      showFeedback(`${student.name} marked as inactive.`);
      refetch();
    } catch (_) {
      showFeedback('Failed to update student status.');
    }
  };

  const handleActivate = async (student: Student) => {
    try {
      // It will auto compute status based on amounts in updateStudent if we don't pass status directly
      await updateStudent(student.id, { 
        expected_amount: student.expected_amount,
        paid_amount: student.paid_amount
       });
      showFeedback(`${student.name} marked as active.`);
      refetch();
    } catch (_) {
      showFeedback('Failed to activate student.');
    }
  };

  const formatCurrency = (val: number) => '₹' + val.toLocaleString('en-IN');

  const getStatusBadge = (status: StudentStatus) => {
    switch(status) {
      case 'paid': return <Badge variant="income">PAID</Badge>;
      case 'partial': return <Badge variant="warning">PARTIAL</Badge>;
      case 'not_paid': return <Badge variant="expense">NOT PAID</Badge>;
      case 'overpaid': return <Badge variant="income">OVERPAID</Badge>;
      case 'inactive': return <Badge variant="neutral">INACTIVE</Badge>;
    }
  };

  if (loading) return <LoadingState message="Loading students…" />;
  if (error) return <ErrorState title="Failed to load students" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Students"
        description="Track student contributions and payment statuses independently of the financial ledger."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setBulkOpen(true)}>
              Bulk Add
            </Button>
            <Button
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => {
                setEditingStudent(null);
                setFormOpen(true);
              }}
            >
              Add Student
            </Button>
          </div>
        }
      />

      {feedback && (
        <div className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-50 text-accent-700 border border-accent-200 rounded-md dark:bg-accent-950/30 dark:text-accent-400 dark:border-accent-800">
          <CheckCircle2 size={16} className="shrink-0 text-accent-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card padding="sm" className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <Users size={14} /> Total Students
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)]">{summary.total_students}</div>
          <div className="text-[10px] text-[var(--text-tertiary)] flex gap-2">
            <span className="text-income-600 font-medium">{summary.paid} Paid</span>
            <span className="text-warning-600 font-medium">{summary.partial} Partial</span>
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

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="search"
            placeholder="Search by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-2.5 py-1.5 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]"
        >
          <option value="all">Active Students</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="not_paid">Not Paid</option>
          <option value="overpaid">Overpaid</option>
          <option value="inactive">Inactive Students</option>
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="px-2.5 py-1.5 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]"
        >
          <option value="name">Sort by Name</option>
          <option value="remaining_desc">Highest Remaining</option>
          <option value="remaining_asc">Lowest Remaining</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <EmptyState
            title="No students found"
            description="Add students to start tracking contributions."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                Add Student
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudents.map(student => {
            const isInactive = student.status === 'inactive';
            const remaining = Math.max(0, student.expected_amount - student.paid_amount);
            const progress = student.expected_amount > 0 
              ? Math.min(100, Math.round((student.paid_amount / student.expected_amount) * 100))
              : student.paid_amount > 0 ? 100 : 0;
            
            return (
              <Card key={student.id} padding="sm" className={`flex flex-col gap-3 relative ${isInactive ? 'opacity-60 bg-[var(--surface-secondary)]/50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{student.name}</h3>
                    <div className="mt-1">{getStatusBadge(student.status)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!isInactive && (
                      <button
                        onClick={() => {
                          setEditingStudent(student);
                          setPaymentOpen(true);
                        }}
                        className="p-1.5 bg-accent-50 text-accent-700 hover:bg-accent-100 dark:bg-accent-950/30 dark:text-accent-400 dark:hover:bg-accent-900/40 rounded-md transition-colors font-medium text-xs flex items-center gap-1 cursor-pointer border border-accent-200 dark:border-accent-800"
                        title="Update Payment"
                      >
                        <Banknote size={14} /> Update
                      </button>
                    )}
                    <div className="relative group">
                      <button className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--surface-tertiary)] cursor-pointer">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-32 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col py-1">
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setFormOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs text-left hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        {isInactive ? (
                          <button
                            onClick={() => handleActivate(student)}
                            className="px-3 py-1.5 text-xs text-left hover:bg-[var(--surface-secondary)] text-income-600 flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 size={12} /> Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeactivate(student)}
                            className="px-3 py-1.5 text-xs text-left hover:bg-[var(--surface-secondary)] text-warning-600 flex items-center gap-2 cursor-pointer"
                          >
                            <Ban size={12} /> Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
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
                    <span className="block text-xs text-[var(--text-tertiary)]">Remaining: {formatCurrency(remaining)}</span>
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
          })}
        </div>
      )}

      <StudentFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingStudent(null);
        }}
        initialData={editingStudent}
        onSuccess={() => {
          showFeedback(`Student ${editingStudent ? 'updated' : 'added'} successfully.`);
          refetch();
        }}
      />

      <BulkAddStudentModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSuccess={() => {
          showFeedback('Students added successfully.');
          refetch();
        }}
        existingStudents={students}
      />

      <UpdatePaymentModal
        open={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        onSuccess={() => {
          showFeedback('Payment updated successfully.');
          refetch();
        }}
      />
    </div>
  );
}
