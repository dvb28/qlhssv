'use client';
import { ReactNode } from 'react';
import { SessionProvider as NextAutProvider } from 'next-auth/react';

type Props = {
  children: ReactNode;
};

export default function SessionProvider({ children }: Props) {
  return (
    <NextAutProvider>
      {children}
    </NextAutProvider>
  );
}
