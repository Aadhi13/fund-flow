import { supabase } from '../lib/supabase';
import type { Student, StudentSummary, CreateStudentInput, UpdateStudentInput, StudentStatus } from '../types';

interface StudentRow {
  id: string;
  name: string;
  expected_amount: string;
  paid_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

function parseStudent(row: StudentRow): Student {
  return {
    ...row,
    expected_amount: parseFloat(row.expected_amount),
    paid_amount: parseFloat(row.paid_amount),
    status: row.status as StudentStatus,
  };
}

export function computeStudentStatus(expected: number, paid: number): StudentStatus {
  if (paid === 0) return 'not_paid';
  if (paid < expected) return 'partial';
  if (paid === expected) return 'paid';
  if (paid > expected) return 'overpaid';
  return 'not_paid'; // Fallback
}

export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as StudentRow[]).map(parseStudent);
}

export function computeStudentSummary(students: Student[]): StudentSummary {
  const active = students.filter(s => s.status !== 'inactive');
  let paid = 0, partial = 0, not_paid = 0, total_expected = 0, total_collected = 0;

  active.forEach(s => {
    total_expected += Math.round(s.expected_amount * 100);
    total_collected += Math.round(s.paid_amount * 100);

    if (s.status === 'paid' || s.status === 'overpaid') paid++;
    else if (s.status === 'partial') partial++;
    else if (s.status === 'not_paid') not_paid++;
  });

  return {
    total_students: active.length,
    paid,
    partial,
    not_paid,
    total_expected: total_expected / 100,
    total_collected: total_collected / 100,
    total_remaining: Math.max(0, (total_expected - total_collected) / 100),
  };
}

export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const status = computeStudentStatus(input.expected_amount, 0);

  const { data, error } = await supabase
    .from('students')
    .insert({
      name: input.name.trim(),
      expected_amount: input.expected_amount,
      paid_amount: 0,
      status,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return parseStudent(data as StudentRow);
}

export async function updateStudent(id: string, input: UpdateStudentInput): Promise<Student> {
  // If we only receive some inputs, we might need the existing values to compute status.
  // Actually, the caller should compute the status or pass both amounts.
  // But to be safe, let's fetch first if we are updating amounts without status.
  // We'll let the caller pass the status or we compute it if both are provided.
  let status = input.status;
  if (input.expected_amount !== undefined && input.paid_amount !== undefined) {
    status = computeStudentStatus(input.expected_amount, input.paid_amount);
  }

  const payload = { ...input };
  if (status) payload.status = status;

  const { data, error } = await supabase
    .from('students')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return parseStudent(data as StudentRow);
}

export async function bulkCreateStudents(students: CreateStudentInput[]): Promise<Student[]> {
  if (students.length === 0) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const rows = students.map(s => ({
    name: s.name.trim(),
    expected_amount: s.expected_amount,
    paid_amount: 0,
    status: computeStudentStatus(s.expected_amount, 0),
    created_by: user.id,
  }));

  const { data, error } = await supabase
    .from('students')
    .insert(rows)
    .select();

  if (error) throw error;
  return (data as StudentRow[]).map(parseStudent);
}
