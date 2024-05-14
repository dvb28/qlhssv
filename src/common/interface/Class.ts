type ClassDataFaculty = {
  name: string;
};

type ClassDataCourse = {
  name: string;
};

export default interface Class {
  id: string;
  name: string;
  faculty_id: string;
  course_id: string;
  course?: ClassDataCourse;
  faculty?: ClassDataFaculty;
  identifier_id: string;
  desc: string;
  created_at: Date;
  updated_at: Date;
}
