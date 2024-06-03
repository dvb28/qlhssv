import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import '@/common/styles/globals.css';
import * as React from 'react';
import { Toaster } from 'sonner';
import AppProgress from '@/components/custom/app.progress';
import SessionProvider from '@/common/providers/session.providers';
import { ThemeProvider } from '@/components/theme/theme.providers';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
          >
            <AppProgress />
            <Toaster position="top-right" richColors duration={3000} />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
