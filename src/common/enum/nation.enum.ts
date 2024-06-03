export enum NationEnum {
  VIETNAM = 'VIETNAM',
  OTHER = 'OTHER',
}

export const NationToString = (key: NationEnum) => {
  switch (key) {
    case NationEnum.VIETNAM:
      return 'Việt Nam';
    case NationEnum.OTHER:
      return 'Khác';
  }
};
