import { Column } from '@tanstack/react-table';
import { CSSProperties } from 'react';

export const getCommonPinningStyles = (column: Column<any>): CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    backgroundColor: 'white',
    zIndex: isPinned ? 1 : 0,
  };
};
