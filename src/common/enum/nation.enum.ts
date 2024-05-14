export enum NationEnum {
  VIETNAM = 'VIETNAM',
  KOREA = 'KOREA',
  JAPAN = 'JAPAN',
  CHINA = 'CHINA',
  TAIWAN = 'TAIWAN',
  THAILAND = 'THAILAND',
  TURKEY = 'TURKEY',
  OTHER = 'OTHER',
}

export const NationToString = (key: NationEnum) => {
  switch (key) {
    case NationEnum.VIETNAM:
      return 'Việt Nam';
    case NationEnum.KOREA:
      return 'Hàn Quốc';
    case NationEnum.JAPAN:
      return 'Nhật Bản';
    case NationEnum.CHINA:
      return 'Trung Quốc';
    case NationEnum.TAIWAN:
      return 'Trung Quốc';
    case NationEnum.THAILAND:
      return 'Thái Lan';
    case NationEnum.TURKEY:
      return 'Nga';
    case NationEnum.OTHER:
      return 'Khác';
  }
};
