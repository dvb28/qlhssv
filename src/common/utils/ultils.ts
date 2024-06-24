import { Column } from '@tanstack/react-table';
import { CSSProperties } from 'react';
import { Role } from '../enum/role.enum';

export const getCommonPinningStyles = (column: Column<any>): CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    zIndex: isPinned ? 1 : 0,
  };
};

export const errors = (toast: any, error: string[] | string) => {
  // Check list error
  if (Array.isArray(error)) {
    // Show error
    error.forEach((err: string, i: number) => {
      i !== error.length - 1 && toast.error(err);
    });

    // Return
    return error[0];
  } else {
    // Return
    return error;
  }
};

// Use Role
export const verifyRole = (
  roles: string,
  role: Role | Role[],
  element: any,
) => {
  // Check role
  if (!roles) return false;

  // Roles Array
  const roles_array = roles.split(' ');

  // Loop
  for (let i = 0; i < roles_array.length; i++) {
    // Check
    if (role.includes(roles_array[i] as Role)) {
      // Return
      return element;
    }

    // Check is route not match
    if (i === roles_array.length - 1) return null;
}
};
