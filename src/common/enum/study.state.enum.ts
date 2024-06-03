export enum StudyStateEnum {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  NOTYET = 'NOTYET',
}

export const StateToString = (key: StudyStateEnum) => {
  switch (key) {
    case StudyStateEnum.ACCEPTED:
      return 'Đi học';
    case StudyStateEnum.REJECTED:
      return 'Bỏ học';
    case StudyStateEnum.PENDING:
      return 'Bảo lưu';
    case StudyStateEnum.NOTYET:
      return 'Chưa đi học';
  }
};
