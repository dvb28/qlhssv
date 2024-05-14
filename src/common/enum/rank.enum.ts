export enum RankEnum {
  TOT = 'TOT',
  KEM = 'KEM',
  KHA = 'KHA',
}

export const RankToString = (key: RankEnum) => {
  switch (key) {
    case RankEnum.TOT:
      return 'Tốt';
    case RankEnum.KEM:
      return 'Khá';
    case RankEnum.KHA:
      return 'Kém';
  }
};
