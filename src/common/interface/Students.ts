type StudentsDataClass = {
  name: string;
};

type StudentsDataMajors = {
  name: string;
};


export default interface Students {
  id: string;
  class_id: string;
  email: string;
  cccd: string;
  fullname: string;
  gender: string;
  nationality: string;
  religion: string;
  nation: string;
  phone: string;
  approve: boolean;
  state: string;
  msv: string;
  study_rank: string;
  morality_rank: string;
  graduate_rank: string;
  graduate_year: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  place_of_birth: string;
  father_date_of_birth: string;
  mother_date_of_birth: string;
  home_town: string;
  hdt: string;
  main_majors: string;
  extra_majors: string;
  sbd: string;
  block: string;
  area: string;
  admissions_industry: string;
  suj_score_1: string;
  suj_score_2: string;
  suj_score_3: string;
  plus_score: string;
  total_score: string;
  count: string;
  classes: StudentsDataClass;
  mmr: StudentsDataMajors;
  emr: StudentsDataMajors;
  aimr: StudentsDataMajors;
  created_at: Date;
  updated_at: Date;
}
