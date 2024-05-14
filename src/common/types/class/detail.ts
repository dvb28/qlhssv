import Class from '@/common/interface/Class';

export interface ClassDetail extends Class {
  students: number;
  students_rejected: number;
  students_accepted: number;
  students_pending: number;
}
