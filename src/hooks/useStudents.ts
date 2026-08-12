import { useState, useEffect, useCallback } from 'react';
import { getStudents, computeStudentSummary } from '../data/students';
import type { Student, StudentSummary } from '../types';

interface UseStudentsResult {
  students: Student[];
  summary: StudentSummary;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudents(): UseStudentsResult {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const summary = computeStudentSummary(students);

  return { students, summary, loading, error, refetch: fetch };
}
