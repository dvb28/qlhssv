import Faculty from "@/common/interface/Faculty";

export interface FacultyDetail extends Faculty {
  students: number;
  majors: number;
  classes: number;
}
