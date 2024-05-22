type MajorFaculty = {
  name: string;
};

export default interface Majors {
  id: string;
  name: string;
  faculty_id: string;
  faculty: MajorFaculty;
  identifier_id: string;
  desc: string;
  created_at: Date;
  updated_at: Date;
}
