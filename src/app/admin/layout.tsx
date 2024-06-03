import type { Metadata } from 'next';

import Header from '@/components/ui/header';
import Sidebar from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'QLHSSV',
  description: 'Quản lý hồ sơ sinh viên',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:pb-4 sm:pl-14">
        <Header />
        {children}
      </div>
    </div>
  );
}
