import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import '@/common/styles/globals.css';
import * as React from 'react';
import { Toaster } from 'sonner';
import AppProgress from '@/components/custom/app.progress';
import SessionProvider from '@/common/providers/session.providers';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'QLHSSV',
  description: 'Quản lý hồ sơ sinh viên',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <SessionProvider>
          <AppProgress />
          <Toaster position="top-right" richColors duration={3000} />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
