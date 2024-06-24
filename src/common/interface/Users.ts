import { GenderEnum } from '../enum/gender.enum';

export default interface Users {
  id: string;
  fullname: string;
  email: string;
  image: string;
  avatar: string;
  roles: string;
  gender: GenderEnum;
  created_at: Date;
  updated_at: Date;
}
