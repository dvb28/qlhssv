export enum Role {
  USER = 'USER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export const RoleToString = (key: string) => {
  switch (key) {
    case Role.USER:
      return {
        value: 'USER',
        label: 'Người dùng',
        variant: 'outline',
      };
    case Role.ADMIN:
      return {
        value: 'ADMIN',
        label: 'Admin',
        variant: 'success',
      };
    case Role.MANAGER:
      return {
        value: 'MANAGER',
        label: 'Quản lý',
        variant: 'default',
      };
  }
};
