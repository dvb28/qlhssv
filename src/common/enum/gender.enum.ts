export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export const GenderToString = (gender: GenderEnum) => {
  switch (gender) {
    case GenderEnum.MALE:
      return 'Nam';
    case GenderEnum.FEMALE:
      return 'Nữ';
    case GenderEnum.OTHER:
      return 'Khác';
  }
};
